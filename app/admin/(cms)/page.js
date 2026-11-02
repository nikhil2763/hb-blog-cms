import Link from "next/link";
import { listBlogs } from "@/lib/blogService";
import AdminTable from "@/components/admin/AdminTable";

export const metadata = { title: "Dashboard" };

const DAY = 24 * 60 * 60 * 1000;

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export default async function AdminPage() {
  const blogs = await listBlogs();
  const lastEdited = blogs.reduce((latest, b) => (!latest || b.updatedAt > latest.updatedAt ? b : latest), null);
  const recent = blogs.filter((b) => Date.now() - new Date(b.createdAt).getTime() < 30 * DAY).length;
  const avgRead = blogs.length ? Math.round(blogs.reduce((sum, b) => sum + b.readingTime, 0) / blogs.length) : 0;

  const stats = [
    { label: "Total blogs", value: blogs.length, tone: "violet" },
    { label: "Published in 30 days", value: recent, tone: "cyan" },
    { label: "Avg. reading time", value: `${avgRead} min`, tone: "pink" },
    { label: "Last updated", value: lastEdited ? timeAgo(lastEdited.updatedAt) : "—", note: lastEdited?.title, tone: "amber" },
  ];

  return (
    <main className="admin-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Blog overview</h1>
        </div>
        <Link href="/admin/new" className="btn btn-primary">+ New Blog</Link>
      </header>

      <section className="stats" aria-label="Statistics">
        {stats.map((s) => (
          <div key={s.label} className={`stat stat-${s.tone}`}>
            <span className="stat-label">{s.label}</span>
            <strong className="stat-value">{s.value}</strong>
            {s.note && <span className="stat-note" title={s.note}>{s.note}</span>}
          </div>
        ))}
      </section>

      <AdminTable blogs={blogs} />
    </main>
  );
}
