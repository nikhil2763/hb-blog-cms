"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import { toast } from "@/components/Toaster";

export default function BlogForm({ blog }) {
  const router = useRouter();
  const isEdit = !!blog;
  const [title, setTitle] = useState(blog?.title || "");
  const [description, setDescription] = useState(blog?.description || "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = "Blog title is required.";
    if (!description.replace(/<[^>]*>/g, "").trim()) next.description = "Blog description is required.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) {
      toast.error("Please fill in the required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/blogs/${blog.id}` : "/api/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setErrors(data.errors || {});
        setFormError(data.error || "Could not save the blog.");
        toast.error(data.error || "Could not save the blog.");
        setSaving(false);
        return;
      }
      toast.success(isEdit ? `“${data.blog.title}” was updated.` : `“${data.blog.title}” was published.`);
      // A single push: /admin is dynamic, so it is rendered fresh. An extra refresh() here
      // would re-render the edit page instead and could cancel this navigation.
      router.push("/admin");
    } catch {
      setFormError("Network error — please check your connection and try again.");
      toast.error("Network error — please try again.");
      setSaving(false);
    }
  };

  return (
    <form className="blog-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="title">Blog Title <span className="req">*</span></label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={200}
          placeholder="e.g. How to Build a Website"
          aria-invalid={!!errors.title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
        {isEdit && <p className="hint">Current URL: <code>/blog/{blog.slug}</code> (the slug updates if you change the title)</p>}
      </div>

      <div className="field">
        <label>Blog Description <span className="req">*</span></label>
        <RichTextEditor value={description} onChange={setDescription} invalid={!!errors.description} />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>

      {formError && <p className="form-error" role="alert">{formError}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update Blog" : "Publish Blog"}
        </button>
        <Link href="/admin" className="btn btn-ghost">Cancel</Link>
        {isEdit && <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View live ↗</a>}
      </div>
    </form>
  );
}
