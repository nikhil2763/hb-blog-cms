import Link from "next/link";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = { title: "New Blog" };

export default function NewBlogPage() {
  return (
    <main className="admin-page">
      <header className="page-head">
        <div>
          <Link href="/admin" className="back">← Dashboard</Link>
          <h1>Create a new blog</h1>
        </div>
      </header>
      <div className="panel">
        <BlogForm />
      </div>
    </main>
  );
}
