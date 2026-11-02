import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogById } from "@/lib/blogService";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = { title: "Edit Blog" };

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) notFound();

  return (
    <main className="admin-page">
      <header className="page-head">
        <div>
          <Link href="/admin" className="back">← Dashboard</Link>
          <h1>Edit blog</h1>
        </div>
      </header>
      <div className="panel">
        <BlogForm key={blog.updatedAt} blog={blog} />
      </div>
    </main>
  );
}
