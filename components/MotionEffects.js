"use client";

import { useEffect } from "react";

// Site-wide motion: reveals [data-reveal] elements in 3D as they scroll into view and moves the cursor glow.
// Content is only hidden once JS has added "motion-ready", so it stays visible to crawlers and no-JS visitors.
export default function MotionEffects() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const watch = () => {
      document.querySelectorAll("[data-reveal]:not([data-watched])").forEach((el) => {
        el.setAttribute("data-watched", "");
        io.observe(el);
      });
    };
    watch();
    // Pages rendered after client-side navigation add new [data-reveal] nodes.
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${e.clientX}px`);
        root.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    const finePointer = !window.matchMedia("(pointer: coarse)").matches;
    if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <div className="cursor-glow" aria-hidden="true" />;
}
