import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBlogById, updateBlog, deleteBlog, HttpError } from "@/lib/blogService";
import { assertAdmin, errorResponse, readJson } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

function revalidateBlog(slugs) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  slugs.filter(Boolean).forEach((slug) => revalidatePath(`/blog/${slug}`));
}

export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    const blog = await getBlogById(id);
    if (!blog) throw new HttpError(404, "Blog not found");
    return NextResponse.json({ blog });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req, { params }) {
  try {
    await assertAdmin();
    const { id } = await params;
    const { blog, previousSlug } = await updateBlog(id, await readJson(req));
    revalidateBlog([previousSlug, blog.slug]);
    return NextResponse.json({ blog });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req, { params }) {
  try {
    await assertAdmin();
    const { id } = await params;
    const removed = await deleteBlog(id);
    revalidateBlog([removed.slug]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
