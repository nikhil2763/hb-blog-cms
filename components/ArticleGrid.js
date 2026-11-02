"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HASH = "#all-articles";
const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" });

// Responsive grid of every post below the 3D stage. Hidden until the stage's "View all" link
// sets #all-articles; the markup is always in the HTML (just `hidden`), so crawlers still see it.
export default function ArticleGrid({ blogs }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash !== HASH) return;
      setOpen(true);
      requestAnimationFrame(() => document.getElementById("all-articles")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const hide = () => {
    setOpen(false);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="all-articles" className="container all-articles" aria-labelledby="all-articles-title" hidden={!open}>
      <div className="all-head" data-reveal>
        <div>
          <h2 id="all-articles-title">All articles</h2>
          <span className="muted">{blogs.length} posts</span>
        </div>
        <button type="button" className="stage-all" onClick={hide}>Hide ↑</button>
      </div>
      <div className="article-grid">
        {blogs.map((blog, i) => (
          <Link key={blog.id} href={`/blog/${blog.slug}`} className="article-tile" data-reveal style={{ "--d": `${(i % 4) * 70}ms` }}>
            <p className="card-date">
              <time dateTime={blog.createdAt}>{fmt(blog.createdAt)}</time> · {blog.readingTime} min read
            </p>
            <h3>{blog.title}</h3>
            <p className="tile-excerpt">{blog.excerpt}</p>
            <span className="card-more">Read More <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
