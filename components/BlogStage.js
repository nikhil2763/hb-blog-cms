"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HEADER = 64;
const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const pad = (n) => String(n).padStart(2, "0");
const perRowFor = (width) => (width >= 1000 ? 3 : width >= 640 ? 2 : 1);

function chunk(list, size) {
  const rows = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

// Pinned 3D stage used on /blog: the page scrolls, but the stage stays in place and each scroll
// step brings the next row of cards (3 on desktop, 2 on tablet, 1 on mobile) up from below in 3D.
// Every card is a real link in the HTML, so crawlers see all posts.
export default function BlogStage({ blogs, children }) {
  const stageRef = useRef(null);
  const rowsRef = useRef([]);
  const counterRef = useRef(null);
  const rangeRef = useRef(null);
  const barRef = useRef(null);
  const motion = useRef({ current: 0, target: 0, frame: 0 });
  const [perRow, setPerRow] = useState(3);
  const rows = chunk(blogs, perRow);
  const n = rows.length;

  useEffect(() => {
    const update = () => setPerRow(perRowFor(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Window scroll offset at which row i is in place (null once unmounted).
  const scrollForIndex = (i) => {
    const el = stageRef.current;
    if (!el) return null;
    const total = el.offsetHeight - (window.innerHeight - HEADER);
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER;
    return top + (n > 1 ? (i / (n - 1)) * total : 0);
  };

  const goTo = (i, smooth = true) => {
    const top = scrollForIndex(i);
    if (top !== null) window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    const s = motion.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let snapTimer = 0;
    document.documentElement.classList.add("motion-ready");

    // The next row rises from below tilted back; the finished row lifts away and folds back.
    const apply = (pos) => {
      const rise = Math.min(window.innerHeight * 0.62, 580);
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        const offset = i - pos;
        const dist = Math.abs(offset);
        const side = clamp(offset, -1, 1);
        const lift = offset < 0 ? 0.55 : 1;
        row.style.transform =
          `translate(-50%, -50%) translate3d(0, ${offset * rise * lift}px, ${-dist * 280}px) ` +
          `rotateX(${side * 36}deg) scale(${1 - Math.min(dist, 2) * 0.1})`;
        row.style.opacity = dist > 1.5 ? "0" : String(1 - Math.min(dist, 1.5) * 0.62);
        row.style.zIndex = String(100 - Math.round(dist * 10));
        row.style.pointerEvents = dist > 0.45 ? "none" : "auto";
        row.classList.toggle("is-active", dist < 0.5);
      });
      const active = clamp(Math.round(pos), 0, n - 1);
      if (counterRef.current) counterRef.current.textContent = pad(active + 1);
      if (rangeRef.current) {
        const first = active * perRow + 1;
        rangeRef.current.textContent = `Showing ${first}–${Math.min(first + perRow - 1, blogs.length)} of ${blogs.length}`;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${n > 1 ? pos / (n - 1) : 1})`;
    };

    // Returns false once the stage has been unmounted (e.g. while navigating to a post).
    const measure = () => {
      const el = stageRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - (window.innerHeight - HEADER);
      s.target = (total > 0 ? clamp((HEADER - rect.top) / total, 0, 1) : 0) * (n - 1);
      s.pinned = rect.top <= HEADER + 1 && rect.bottom >= window.innerHeight - 1;
      return true;
    };

    const tick = () => {
      s.frame = 0;
      if (!stageRef.current) return;
      s.current += (s.target - s.current) * (reduce ? 1 : 0.14);
      if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target;
      apply(s.current);
      if (s.current !== s.target) s.frame = requestAnimationFrame(tick);
    };

    // Settle on the nearest row once scrolling stops.
    const onScroll = () => {
      if (!measure()) return;
      if (!s.frame) s.frame = requestAnimationFrame(tick);
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        if (!stageRef.current) return;
        const nearest = Math.round(s.target);
        if (Math.abs(nearest - s.target) > 0.02) goTo(nearest, !reduce);
      }, 160);
    };

    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!step || !s.pinned) return;
      const next = clamp(Math.round(s.target) + step, 0, n - 1);
      if (next === Math.round(s.target)) return;
      e.preventDefault();
      goTo(next, !reduce);
    };

    measure();
    s.current = s.target;
    apply(s.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(s.frame);
      s.frame = 0;
      clearTimeout(snapTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, perRow]);

  const onCardMove = (e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--tx", `${((e.clientY - r.top) / r.height - 0.5) * -12}deg`);
    card.style.setProperty("--ty", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
    card.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const onCardLeave = (e) => {
    e.currentTarget.style.setProperty("--tx", "0deg");
    e.currentTarget.style.setProperty("--ty", "0deg");
  };

  return (
    <section ref={stageRef} className="stage" style={{ "--count": n }} aria-label="Blog articles">
      <div className="stage-sticky">
        <div className="container stage-head">{children}</div>

        <div className="stage-track">
          {rows.map((row, r) => (
            <div key={`${perRow}-${r}`} ref={(el) => (rowsRef.current[r] = el)} className="stage-row" style={{ "--cols": perRow }}>
              {row.map((blog, c) => {
                const index = r * perRow + c;
                return (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="stage-card"
                    onFocus={(e) => e.currentTarget.matches(":focus-visible") && goTo(r, false)}
                    onMouseMove={onCardMove}
                    onMouseLeave={onCardLeave}
                  >
                    <article className="stage-card-inner">
                      <span className={`card-orb orb-${index % 4}`} aria-hidden="true" />
                      <span className="stage-num" aria-hidden="true">{pad(index + 1)}</span>
                      <p className="card-date">
                        <time dateTime={blog.createdAt}>{fmt(blog.createdAt)}</time> · {blog.readingTime} min read
                      </p>
                      <h2 className="card-title">{blog.title}</h2>
                      <p className="card-excerpt">{blog.excerpt}</p>
                      <span className="card-more">Read article <span aria-hidden="true">→</span></span>
                      <span className="card-glare" aria-hidden="true" />
                    </article>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="container stage-foot">
          <span className="stage-count"><span ref={counterRef}>01</span><small> / {pad(n)}</small></span>
          <span className="stage-bar" aria-hidden="true"><span ref={barRef} /></span>
          <span className="stage-range" ref={rangeRef}>Showing 1–{Math.min(perRow, blogs.length)} of {blogs.length}</span>
          <span className="stage-hint">Scroll or use ↑ ↓</span>
          <a href="#all-articles" className="stage-all">View all ↓</a>
        </div>
      </div>
    </section>
  );
}
