import { listBlogs } from "@/lib/blogService";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const blogs = await listBlogs().catch(() => []);
  return [
    { url: absoluteUrl("/blog"), lastModified: blogs[0]?.updatedAt || new Date(), changeFrequency: "daily", priority: 1 },
    ...blogs.map((b) => ({
      url: absoluteUrl(`/blog/${b.slug}`),
      lastModified: b.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];
}
