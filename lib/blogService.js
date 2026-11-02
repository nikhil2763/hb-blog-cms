import mongoose from "mongoose";
import { connectDB } from "./mongodb";
import Blog from "@/models/Blog";
import { sanitizeContent, toPlainText, makeExcerpt, readingTime } from "./sanitize";

export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// "How to Build a Website!" -> "how-to-build-a-website"
export function slugify(text) {
  const slug = String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "blog";
}

// Appends -2, -3 ... when the base slug is already taken by another blog.
async function uniqueSlug(title, excludeId) {
  const base = slugify(title);
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = { slug: new RegExp(`^${escaped}(-\\d+)?$`) };
  if (excludeId) filter._id = { $ne: excludeId };
  const taken = new Set((await Blog.find(filter, { slug: 1 }).lean()).map((b) => b.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function validate(input) {
  const errors = {};
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const description = sanitizeContent(typeof input?.description === "string" ? input.description : "");
  if (!title) errors.title = "Blog title is required.";
  else if (title.length > 200) errors.title = "Title must be 200 characters or fewer.";
  if (!toPlainText(description)) errors.description = "Blog description is required.";
  if (Object.keys(errors).length) throw new HttpError(400, "Validation failed", errors);
  return { title, description };
}

function serialize(doc, { full = true } = {}) {
  const out = {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    excerpt: makeExcerpt(doc.description),
    readingTime: readingTime(doc.description),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
  if (full) out.description = doc.description;
  return out;
}

const isDuplicateKey = (err) => err && err.code === 11000;

export async function listBlogs() {
  await connectDB();
  const docs = await Blog.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => serialize(d, { full: false }));
}

export async function getBlogBySlug(slug) {
  await connectDB();
  const doc = await Blog.findOne({ slug: String(slug).toLowerCase() }).lean();
  return doc ? serialize(doc) : null;
}

export async function getBlogById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await Blog.findById(id).lean();
  return doc ? serialize(doc) : null;
}

// Tries the plain slug first (one DB round-trip); only on a clash does it look up a free suffix.
export async function createBlog(input) {
  const data = validate(input);
  await connectDB();
  let slug = slugify(data.title);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const doc = await Blog.create({ ...data, slug });
      return serialize(doc.toObject());
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      slug = await uniqueSlug(data.title);
    }
  }
  throw new HttpError(409, "Could not generate a unique slug, please try again.");
}

// Returns the updated blog plus the slug it had before, so callers can refresh both URLs.
export async function updateBlog(id, input) {
  const data = validate(input);
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Blog not found");
  await connectDB();
  const existing = await Blog.findById(id);
  if (!existing) throw new HttpError(404, "Blog not found");
  const previousSlug = existing.slug;
  const titleChanged = existing.title !== data.title;
  let slug = titleChanged ? slugify(data.title) : existing.slug;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      existing.set({ title: data.title, description: data.description, slug });
      // Saving always counts as an edit, even if the text ended up identical.
      existing.updatedAt = new Date();
      await existing.save({ timestamps: false });
      return { blog: serialize(existing.toObject()), previousSlug };
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      slug = await uniqueSlug(data.title, existing._id);
    }
  }
  throw new HttpError(409, "Could not generate a unique slug, please try again.");
}

export async function deleteBlog(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Blog not found");
  await connectDB();
  const res = await Blog.findByIdAndDelete(id);
  if (!res) throw new HttpError(404, "Blog not found");
  return serialize(res.toObject(), { full: false });
}
