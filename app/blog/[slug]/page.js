import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Hero3D from "@/components/Hero3D";
import JsonLd from "@/components/JsonLd";
import ScrollProgress from "@/components/ScrollProgress";
import SplitWords from "@/components/SplitWords";
import { getBlogBySlug } from "@/lib/blogService";
import { sanitizeContent } from "@/lib/sanitize";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

// One DB read per request, shared by generateMetadata and the page.
const getPost = cache(getBlogBySlug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getPost(slug);
  if (!blog) return { title: "Blog not found", robots: { index: false } };
  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      url: `/blog/${blog.slug}`,
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
    },
    twitter: { card: "summary_large_image", title: blog.title, description: blog.excerpt },
  };
}

const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" });

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await getPost(slug);
  if (!blog) notFound();

  const edited = blog.updatedAt.slice(0, 16) !== blog.createdAt.slice(0, 16);
  const url = absoluteUrl(`/blog/${blog.slug}`);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt,
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt,
      mainEntityOfPage: url,
      url,
      image: `${url}/opengraph-image`,
      author: { "@type": "Organization", name: "HB Softweb" },
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Blog", item: absoluteUrl("/blog") },
        { "@type": "ListItem", position: 2, name: blog.title, item: url },
      ],
    },
  ];

  return (
    <main>
      <JsonLd data={structuredData} />
      <ScrollProgress />
      <Hero3D variant="post" compact pinned>
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/blog" className="back light">← All blogs</Link>
        </nav>
        <h1 className="post-title"><SplitWords text={blog.title} /></h1>
        <p className="post-meta">
          <time dateTime={blog.createdAt}>{fmt(blog.createdAt)}</time>
          {edited && <> · Updated <time dateTime={blog.updatedAt}>{fmt(blog.updatedAt)}</time></>}
          {" · "}{blog.readingTime} min read
        </p>
      </Hero3D>

      <article className="container post">
        {/* Content is sanitized on save and again here before rendering. */}
        <div className="prose post-body" data-reveal dangerouslySetInnerHTML={{ __html: sanitizeContent(blog.description) }} />
        <div className="post-footer" data-reveal>
          <Link href="/blog" className="btn btn-ghost">← Back to all blogs</Link>
        </div>
      </article>
    </main>
  );
}
