import mongoose from "mongoose";
import { connectDB } from "../lib/mongodb.js";
import Blog from "../models/Blog.js";
import { sanitizeContent } from "../lib/sanitize.js";

const c = (color, text) => `<span style="color: ${color}">${text}</span>`;
const hl = (color, text) => `<mark data-color="${color}" style="background-color: ${color}; color: inherit">${text}</mark>`;
const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const int = (href, text) => `<a href="${href}">${text}</a>`;

// daysAgo spreads the publish dates so the listing has a natural order (newest first).
const samples = [
  {
    title: "How to Build a Website",
    slug: "how-to-build-a-website",
    daysAgo: 1,
    description: `
<h2>Start with a plan</h2>
<p>Every great website begins with a <strong>clear goal</strong>. Decide <em>who</em> it is for and <u>what</u> they should do on it.</p>
<p>Pick your stack: ${c("#2563eb", "HTML")}, ${c("#ea580c", "CSS")} and ${c("#ca8a04", "JavaScript")} are the foundation of everything.</p>
<h3>Useful resources</h3>
<ul>
  <li>${ext("https://developer.mozilla.org/en-US/docs/Learn", "MDN Learning Area")} (opens in a new tab)</li>
  <li>${int("/blog/introduction-to-web-development", "Introduction to Web Development")} (opens in the same tab)</li>
</ul>
<p>${hl("#fde047", "Tip:")} ship a small first version, then improve it.</p>`,
  },
  {
    title: "Benefits of Next.js",
    slug: "benefits-of-nextjs",
    daysAgo: 3,
    description: `
<p><strong>Next.js</strong> is a React framework that gives you <em>routing</em>, <em>server rendering</em> and <em>API routes</em> out of the box. This very blog is built with it.</p>
<blockquote><p>Fast by default, flexible when you need it.</p></blockquote>
<ol>
  <li>${c("#16a34a", "<strong>Performance</strong>")} — automatic code splitting and optimized fonts.</li>
  <li>${c("#9333ea", "<strong>SEO</strong>")} — pages are rendered on the server with real meta tags, sitemaps and structured data.</li>
  <li>${hl("#bbf7d0", "Developer experience")} — fast refresh and zero config.</li>
</ol>
<p>Read the official docs at ${ext("https://nextjs.org/docs", "nextjs.org/docs")}, or go back to ${int("/blog", "all blogs")}.</p>`,
  },
  {
    title: "Introduction to Web Development",
    slug: "introduction-to-web-development",
    daysAgo: 5,
    description: `
<p>Web development is split into the ${c("#db2777", "<strong>frontend</strong>")} (what users see) and the ${c("#0891b2", "<strong>backend</strong>")} (servers and databases).</p>
<h2>Frontend</h2>
<p>Built with HTML, CSS and JavaScript, often using libraries like ${ext("https://react.dev", "React")}.</p>
<h2>Backend</h2>
<p>Handles data with tools like <u>Node.js</u> and databases like ${hl("#bfdbfe", "MongoDB")}.</p>
<p>Ready for a project? Follow ${int("/blog/how-to-build-a-website", "How to Build a Website")}.</p>`,
  },
  {
    title: "Mastering CSS Grid Layout",
    slug: "mastering-css-grid-layout",
    daysAgo: 8,
    description: `
<p><strong>CSS Grid</strong> is a two-dimensional layout system that lets you place items in <em>rows and columns</em> at the same time.</p>
<h2>The three lines you need</h2>
<ul>
  <li><code>display: grid</code> — turns a container into a grid.</li>
  <li><code>grid-template-columns</code> — defines the columns, e.g. ${hl("#fde68a", "repeat(auto-fill, minmax(280px, 1fr))")}.</li>
  <li><code>gap</code> — adds consistent spacing between items.</li>
</ul>
<h3>Grid vs Flexbox</h3>
<p>Use ${c("#7c3aed", "<strong>Grid</strong>")} for page-level layouts and ${c("#0891b2", "<strong>Flexbox</strong>")} for one-direction alignment inside components.</p>
<p>Practise with ${ext("https://cssgridgarden.com", "Grid Garden")}, then read ${int("/blog/responsive-design-best-practices", "Responsive Design Best Practices")}.</p>`,
  },
  {
    title: "A Beginner's Guide to MongoDB",
    slug: "beginners-guide-to-mongodb",
    daysAgo: 11,
    description: `
<p><strong>MongoDB</strong> is a document database: instead of tables and rows, it stores ${hl("#bbf7d0", "JSON-like documents")} inside <em>collections</em>.</p>
<h2>Why developers like it</h2>
<ol>
  <li><strong>Flexible schema</strong> — documents in the same collection can evolve over time.</li>
  <li><strong>Natural fit for JavaScript</strong> — your data looks just like your objects.</li>
  <li><strong>Managed hosting</strong> — ${ext("https://www.mongodb.com/atlas", "MongoDB Atlas")} gives you a free cloud cluster in minutes.</li>
</ol>
<h3>Indexes matter</h3>
<p>This blog uses a ${c("#dc2626", "<strong>unique index</strong>")} on the <code>slug</code> field, so two posts can never share the same URL.</p>
<p>Next, learn how data travels to the browser in ${int("/blog/understanding-rest-apis", "Understanding REST APIs")}.</p>`,
  },
  {
    title: "Understanding REST APIs",
    slug: "understanding-rest-apis",
    daysAgo: 14,
    description: `
<p>A <strong>REST API</strong> lets a client talk to a server using plain <em>HTTP methods</em> and <em>URLs</em>.</p>
<h2>The core verbs</h2>
<ul>
  <li>${c("#16a34a", "<strong>GET</strong>")} — read data</li>
  <li>${c("#2563eb", "<strong>POST</strong>")} — create data</li>
  <li>${c("#ca8a04", "<strong>PUT</strong>")} — update data</li>
  <li>${c("#dc2626", "<strong>DELETE</strong>")} — remove data</li>
</ul>
<h3>Status codes tell the story</h3>
<p><code>200</code> means OK, <code>201</code> created, <code>400</code> bad input, <code>401</code> not logged in and <code>404</code> not found. ${hl("#fde047", "Always return the right code")} — clients depend on it.</p>
<p>The ${ext("https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", "MDN status code reference")} is a great bookmark.</p>`,
  },
  {
    title: "Web Performance Optimization Tips",
    slug: "web-performance-optimization-tips",
    daysAgo: 18,
    description: `
<p>Speed is a feature. A faster site <strong>ranks better</strong>, <strong>converts better</strong> and simply <em>feels</em> better.</p>
<h2>Quick wins</h2>
<ol>
  <li><strong>Optimise images</strong> — serve modern formats like ${hl("#bfdbfe", "WebP or AVIF")} at the right size.</li>
  <li><strong>Lazy-load</strong> anything below the fold, including heavy 3D scenes.</li>
  <li><strong>Split your JavaScript</strong> so each page only loads what it needs.</li>
  <li><strong>Cache</strong> static assets with long expiry headers.</li>
</ol>
<h3>Measure first</h3>
<p>Run ${ext("https://pagespeed.web.dev", "PageSpeed Insights")} and watch the ${c("#9333ea", "Core Web Vitals")}: LCP, INP and CLS.</p>
<p>Performance and search go together — see ${int("/blog/seo-basics-for-developers", "SEO Basics for Developers")}.</p>`,
  },
  {
    title: "Getting Started with Three.js",
    slug: "getting-started-with-threejs",
    daysAgo: 22,
    description: `
<p><strong>Three.js</strong> brings real-time ${c("#7c3aed", "<strong>3D graphics</strong>")} to the browser using WebGL — the floating shapes on this blog are built with it.</p>
<h2>Every scene needs three things</h2>
<ul>
  <li>A <strong>scene</strong> — the world that holds your objects.</li>
  <li>A <strong>camera</strong> — the point of view.</li>
  <li>A <strong>renderer</strong> — draws the scene onto a canvas.</li>
</ul>
<h3>Use React? Try React Three Fiber</h3>
<p>${ext("https://r3f.docs.pmnd.rs", "React Three Fiber")} lets you write 3D scenes as React components, and ${hl("#fbcfe8", "drei")} adds ready-made helpers like stars, sparkles and 3D text.</p>
<p>Keep it fast: lazy-load the canvas — tips in ${int("/blog/web-performance-optimization-tips", "Web Performance Optimization Tips")}.</p>`,
  },
  {
    title: "SEO Basics for Developers",
    slug: "seo-basics-for-developers",
    daysAgo: 27,
    description: `
<p>Search engine optimisation is not magic. Most of it is <strong>clean, well-structured HTML</strong> that search engines can read.</p>
<h2>The checklist</h2>
<ol>
  <li>A unique <code>&lt;title&gt;</code> and ${hl("#fde047", "meta description")} on every page.</li>
  <li><strong>One <code>&lt;h1&gt;</code></strong> per page, followed by logical headings.</li>
  <li><strong>Clean URLs</strong> like <code>/blog/seo-basics-for-developers</code>.</li>
  <li>A <code>sitemap.xml</code>, a <code>robots.txt</code> and canonical links.</li>
  <li>${c("#16a34a", "<strong>Structured data</strong>")} (JSON-LD) to describe articles.</li>
</ol>
<p>Validate your pages with the ${ext("https://search.google.com/test/rich-results", "Rich Results Test")}. This blog renders on the server — read why in ${int("/blog/benefits-of-nextjs", "Benefits of Next.js")}.</p>`,
  },
  {
    title: "Responsive Design Best Practices",
    slug: "responsive-design-best-practices",
    daysAgo: 33,
    description: `
<p>More than half of all traffic is mobile. <strong>Responsive design</strong> makes one site work beautifully on every screen.</p>
<h2>Principles that last</h2>
<ul>
  <li><strong>Mobile first</strong> — start with the smallest screen, then add with <code>min-width</code> media queries.</li>
  <li><strong>Fluid type</strong> — use ${hl("#bbf7d0", "clamp()")} so headings scale smoothly.</li>
  <li><strong>Flexible media</strong> — <code>max-width: 100%</code> on images and videos.</li>
  <li><strong>Touch targets</strong> — at least ${c("#dc2626", "<strong>44×44px</strong>")} for buttons.</li>
</ul>
<p>Test on real devices or with your browser's ${ext("https://developer.chrome.com/docs/devtools/device-mode", "device mode")}. Layout help: ${int("/blog/mastering-css-grid-layout", "Mastering CSS Grid Layout")}.</p>`,
  },
  {
    title: "JavaScript ES6 Features You Should Know",
    slug: "javascript-es6-features",
    daysAgo: 40,
    description: `
<p>Modern JavaScript is <strong>shorter, safer and easier to read</strong>. These ES6+ features show up in almost every codebase today.</p>
<h2>The essentials</h2>
<ol>
  <li>${c("#2563eb", "<strong>let / const</strong>")} — block-scoped variables.</li>
  <li>${c("#9333ea", "<strong>Arrow functions</strong>")} — <code>(a, b) =&gt; a + b</code>.</li>
  <li><strong>Destructuring</strong> — <code>const { title, slug } = blog</code>.</li>
  <li><strong>Template literals</strong> — <code>\`/blog/\${slug}\`</code>.</li>
  <li><strong>async / await</strong> — ${hl("#fde047", "readable asynchronous code")}.</li>
</ol>
<p>The ${ext("https://javascript.info", "Modern JavaScript Tutorial")} covers all of them in depth.</p>`,
  },
  {
    title: "Securing Your Web Application",
    slug: "securing-your-web-application",
    daysAgo: 48,
    description: `
<p>Security is easiest when it is built in from day one. Here are the ${c("#dc2626", "<strong>threats</strong>")} every developer should guard against.</p>
<h2>Top protections</h2>
<ul>
  <li><strong>XSS</strong> — never render untrusted HTML without ${hl("#fecaca", "sanitising it")} first.</li>
  <li><strong>Authentication</strong> — store sessions in <u>httpOnly</u>, signed cookies.</li>
  <li><strong>Brute force</strong> — rate-limit login attempts.</li>
  <li><strong>Safe links</strong> — add <code>rel="noopener noreferrer"</code> to links that open in a new tab.</li>
</ul>
<p>The ${ext("https://owasp.org/www-project-top-ten/", "OWASP Top 10")} is the industry checklist. APIs need care too — see ${int("/blog/understanding-rest-apis", "Understanding REST APIs")}.</p>`,
  },
];

const DAY = 24 * 60 * 60 * 1000;

try {
  await connectDB();
  console.log(`✅ MongoDB connected (db: ${mongoose.connection.name})`);
  for (const s of samples) {
    const date = new Date(Date.now() - s.daysAgo * DAY);
    await Blog.findOneAndUpdate(
      { slug: s.slug },
      {
        $set: { title: s.title, description: sanitizeContent(s.description.trim()) },
        $setOnInsert: { slug: s.slug, createdAt: date, updatedAt: date },
      },
      { upsert: true, new: true, timestamps: false }
    );
    console.log(`  ✔ /blog/${s.slug}`);
  }
  console.log(`🌱 Seed complete (${samples.length} blogs).`);
} catch (err) {
  console.error("❌ Seed failed:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
