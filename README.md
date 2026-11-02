# HB Softweb — Blog CMS (Next.js + MongoDB Atlas + 3D)

A full-stack, SEO-friendly Blog CMS built with **Next.js (App Router)**.

- An admin signs in, writes and formats posts in a rich text editor, and saves them to **MongoDB Atlas**.
- Visitors read the posts on a server-rendered blog that has a full-page **Three.js** 3D scene, a pinned 3D card stage and dynamic `/blog/<slug>` pages.

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, server components, route handlers, middleware) |
| Frontend + backend | Node.js inside Next.js (API routes under `app/api`) |
| Database | MongoDB Atlas via Mongoose 8 |
| Rich text editor | TipTap 2 |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` |
| Auth | Signed JWT session cookie (`jose`), httpOnly, enforced by middleware |
| Security | `sanitize-html` on save **and** on render |
| Styling | Hand-written CSS (`app/globals.css`) |

---

## Features

### Admin CMS (`/admin`)
- **Login** at `/admin/login`:
  - Username and password come from env variables.
  - The session lasts 7 days in a signed httpOnly cookie.
  - After 5 failed attempts, login is locked for 15 minutes.
- **Protection**: every `/admin/*` page and every write API needs a valid session. This is checked in middleware and again inside each route.
- **Dashboard**:
  - Stats: total blogs, posts published in the last 30 days, average reading time, and the last updated post.
  - A searchable blog table with Edit and Delete.
- **Create / edit** blogs with:
  - **Title**: required, max 200 characters.
  - **Description**: a rich text editor with:
    - Bold, italic, underline
    - Text colour, background highlight, and remove colour/highlight
    - Headings, lists, quote, undo and redo
  - **Hyperlinks**:
    - Insert a link, edit its URL and its new/same-tab setting, or remove it.
    - Edit from the toolbar 🔗 button or from the bubble shown on a link.
- **Delete** asks for confirmation in a custom dialog (not `window.confirm`).
- **Toast notifications** for publish, update, delete, login, logout and errors.

### Public site
- **`/blog`** works the same with or without JavaScript:
  - **Pinned 3D stage.** The page stays in place while each scroll step brings the next row of cards (3 per row on desktop, 2 on tablet, 1 on mobile) up from below in 3D. You can also use ↑ / ↓.
  - **"All articles" grid** below the stage, showing every post as a responsive card with title, preview and Read More.
  - Without JavaScript, the stage shows as a normal list, so content is never hidden.
- **`/blog/<slug>`**:
  - A dynamic, server-rendered page that keeps all formatting, colours and link targets.
  - The hero stays pinned and folds away in 3D as the article scrolls over it.
  - A reading progress bar shows how far you are.
  - A missing slug gets a real **404** page and status.
- **3D everywhere**: galaxy particles, orbit rings, a distorted blob, 3D text, pointer parallax and scroll-driven camera motion. Each page has its own scene: blog, post, login, admin and 404.
- **`/`** redirects permanently (308) to `/blog`.

### SEO
- Server-rendered HTML: titles, content and every post link are in the page source.
- Per-post `<title>`, meta description, canonical URL, Open Graph `article` tags and Twitter cards.
- An auto-generated **Open Graph image** for each post (`/blog/<slug>/opengraph-image`).
- JSON-LD structured data: `Blog`, `BlogPosting` and `BreadcrumbList`.
- Dynamic `sitemap.xml` and `robots.txt`. `/admin` and `/api` are disallowed, and admin pages send `noindex`.

### Data & safety
- **Slugs** are generated from the title (`How to Build a Website!` → `how-to-build-a-website`).
  - They are unique: duplicates get `-2`, `-3`, and so on.
  - A unique index in MongoDB guards against races.
  - The slug is regenerated when the title changes.
- **Validation** on the client and the server.
- **XSS protection**: scripts, event handlers, `javascript:` URLs and unknown CSS are removed. Only `color` and `background-color` styles survive.
- **Link safety**: new-tab links always get `rel="noopener noreferrer"`, and same-tab links never get a `target`.

---

## Project structure

```
web/
├── app/
│   ├── layout.js, template.js, globals.css, not-found.js, error.js
│   ├── robots.js, sitemap.js
│   ├── blog/page.js                       # /blog — 3D stage + All articles grid (SSR + JSON-LD)
│   ├── blog/[slug]/page.js                # /blog/<slug> (SSR + metadata + JSON-LD)
│   ├── blog/[slug]/opengraph-image.js     # social preview image
│   ├── admin/login/page.js                # login
│   ├── admin/(cms)/layout.js              # session guard + sidebar
│   ├── admin/(cms)/page.js, new/, edit/[id]/
│   └── api/
│       ├── auth/login, auth/logout
│       └── blogs, blogs/[id]
├── components/
│   ├── Scene3D.js, SceneBackdrop.js, Hero3D.js     # Three.js scenes
│   ├── BlogStage.js, ArticleGrid.js                # /blog layouts
│   ├── MotionEffects.js, ScrollProgress.js, Tilt.js, SplitWords.js
│   ├── Toaster.js, JsonLd.js
│   └── admin/  (BlogForm, RichTextEditor, AdminTable, AdminNav,
│                ConfirmDialog, DeleteButton, LoginForm, LogoutButton)
├── lib/          # mongodb, blogService, sanitize, auth, session, apiResponse, site
├── models/Blog.js
├── public/fonts/ # 3D text font (Helvetiker, MIT licence)
├── scripts/seed.mjs
├── instrumentation.js   # opens the DB connection when the server starts
└── middleware.js        # protects /admin and write APIs
```

## Database schema (`blogs` collection)

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Unique ID |
| `title` | String | Required, trimmed, max 200 |
| `slug` | String | Required, **unique index**, lowercase |
| `description` | String | Sanitized rich-text HTML (formatting + links) |
| `createdAt` | Date | Set automatically |
| `updatedAt` | Date | Set on every save |

---

## Setup (local)

### 1. MongoDB Atlas
1. Create a free **M0** cluster.
2. Under **Database & Network Access → Database Users**, add a user with *Read and write to any database*.
3. In **IP Access List**, add your IP, or `0.0.0.0/0` for hosting.
4. Go to **Clusters → Connect → Drivers → Node.js** and copy the connection string.

### 2. Environment variables

Create **one** file named `.env` in the project root. It is git-ignored, so it never reaches GitHub.

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=blog_cms
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<a strong password>
AUTH_SECRET=<random string, 32+ characters>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | Atlas connection string, with your password |
| `MONGODB_DB` | | Database name (default `blog_cms`) |
| `ADMIN_USERNAME` | ✅ | Admin login username |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `AUTH_SECRET` | ✅ | Random string (32+ chars) that signs the session cookie |
| `NEXT_PUBLIC_SITE_URL` | ✅ in prod | Public URL for canonical links, sitemap and Open Graph |

> Some networks refuse the DNS lookups that `mongodb+srv://` needs (`querySrv ECONNREFUSED`). The app detects this and retries with public DNS automatically.

### 3. Install, seed and run

```bash
npm install
npm run seed     # inserts 12 sample blogs (safe to re-run)
npm run dev      # http://localhost:3000 (Turbopack)
```

Open these pages:
- http://localhost:3000/blog (public blog)
- http://localhost:3000/admin (redirects to login, then the CMS)

> The dev server compiles each page the first time you open it. The first visit to `/blog` takes a few seconds because the 3D library is large; later visits are fast. For real speed, test a production build.

### Production build

```bash
npm run build
npm start
```

⚠️ Stop `npm run dev` before running `npm run build`. Both write to the same `.next` folder, and a running dev server breaks if it is overwritten.

---

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | `{ username, password }` sets the session cookie |
| POST | `/api/auth/logout` | — | Clears the session |
| GET | `/api/blogs` | — | List blogs |
| GET | `/api/blogs/:id` | — | One blog |
| POST | `/api/blogs` | Admin | Create `{ title, description }` |
| PUT | `/api/blogs/:id` | Admin | Update `{ title, description }` |
| DELETE | `/api/blogs/:id` | Admin | Delete |

Validation errors return `400 { error, errors: { title?, description? } }`. Missing sessions return `401`.

## Sample content

`npm run seed` creates 12 posts. They use headings, coloured text, highlights, lists, quotes, and both new-tab and same-tab links, including links between posts. Examples:
- `/blog/how-to-build-a-website`
- `/blog/benefits-of-nextjs`
- `/blog/introduction-to-web-development`
- `/blog/understanding-rest-apis`
- `/blog/securing-your-web-application`

## Deploy (Vercel)

1. Push the repo to GitHub and import it on https://vercel.com. The framework is detected as Next.js automatically.
2. Add the environment variables from the table above. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL.
3. In Atlas **IP Access List**, allow `0.0.0.0/0`, because Vercel's IPs change.
4. Deploy. Then open `/blog` and `/admin` on the live URL.
