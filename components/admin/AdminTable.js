"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

// Blog list with instant client-side search by title or slug.
export default function AdminTable({ blogs: initialBlogs }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [query, setQuery] = useState("");
  // Fresh server data (after a refresh) replaces the local list.
  useEffect(() => setBlogs(initialBlogs), [initialBlogs]);
  const removeRow = (id) => setBlogs((list) => list.filter((b) => b.id !== id));
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? blogs.filter((b) => b.title.toLowerCase().includes(q) || b.slug.includes(q)) : blogs;
  }, [blogs, query]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>All blogs</h2>
          <p className="muted">{rows.length} of {blogs.length} shown</p>
        </div>
        <input
          type="search"
          className="search"
          placeholder="Search by title or slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search blogs"
        />
      </div>

      {rows.length === 0 ? (
        <div className="empty">{blogs.length ? "No blogs match your search." : <>No blogs yet. Create your first one, or run <code>npm run seed</code>.</>}</div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Created</th><th>Updated</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td data-label="Title">
                    <Link href={`/admin/edit/${b.id}`} className="row-title">{b.title}</Link>
                    <a href={`/blog/${b.slug}`} target="_blank" rel="noopener noreferrer" className="row-slug">/blog/{b.slug} ↗</a>
                  </td>
                  <td data-label="Created">{fmt(b.createdAt)}</td>
                  <td data-label="Updated">{fmt(b.updatedAt)}</td>
                  <td className="row-actions">
                    <Link href={`/admin/edit/${b.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                    <DeleteButton id={b.id} title={b.title} onDeleted={removeRow} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
