import LoginForm from "@/components/admin/LoginForm";
import SceneBackdrop from "@/components/SceneBackdrop";
import SplitWords from "@/components/SplitWords";
import Tilt from "@/components/Tilt";

export const metadata = { title: "Admin Login", robots: { index: false, follow: false } };

const FEATURES = [
  { icon: "✎", title: "Rich text editor", text: "Colours, highlights and editable links." },
  { icon: "◎", title: "SEO-ready pages", text: "Server rendering, sitemap and structured data." },
  { icon: "⛨", title: "Secure sessions", text: "Signed httpOnly cookies and rate-limited login." },
];

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const target = typeof next === "string" && next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";

  return (
    <main className="login-page">
      <SceneBackdrop variant="login" />
      <div className="login-shade" aria-hidden="true" />

      <section className="login-intro">
        <p className="eyebrow">HB Softweb · CMS</p>
        <h1 className="login-title"><SplitWords text="Write. Edit. Publish." /></h1>
        <p className="login-lead">Everything you need to run the HB Softweb blog, in one place.</p>
        <ul className="login-features">
          {FEATURES.map((f, i) => (
            <li key={f.title} style={{ "--i": i }}>
              <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              <span><strong>{f.title}</strong><span className="muted">{f.text}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <Tilt className="login-card" max={6}>
        <div className="login-orb" aria-hidden="true" />
        <span className="login-badge" aria-hidden="true">✦</span>
        <h2>Admin sign in</h2>
        <p className="muted">Use your admin credentials to continue.</p>
        <LoginForm next={target} />
      </Tilt>
    </main>
  );
}
