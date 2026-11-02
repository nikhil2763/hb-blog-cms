import SceneBackdrop from "./SceneBackdrop";

// Hero section over the full-page 3D backdrop; the hero text itself is server-rendered for SEO.
// "pinned" keeps the hero in place and fades it back in 3D while the content slides over it.
export default function Hero3D({ variant = "home", compact = false, pinned = false, children }) {
  return (
    <>
      <SceneBackdrop variant={variant} />
      <section className={`hero${compact ? " hero-compact" : ""}${pinned ? " hero-pinned" : ""}`}>
        <div className="hero-overlay" />
        <div className="container hero-content">{children}</div>
      </section>
    </>
  );
}
