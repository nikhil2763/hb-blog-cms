import SceneBackdrop from "@/components/SceneBackdrop";
import BlogStage from "@/components/BlogStage";
import ArticleGrid from "@/components/ArticleGrid";
import JsonLd from "@/components/JsonLd";
import SplitWords from "@/components/SplitWords";
import { listBlogs } from "@/lib/blogService";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Web Development Guides & Stories",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: `Blog | ${SITE_NAME}`, description: SITE_DESCRIPTION, url: "/blog", type: "website" },
};

export default async function BlogListPage() {
  const blogs = await listBlogs();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/blog"),
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      description: b.excerpt,
      url: absoluteUrl(`/blog/${b.slug}`),
      datePublished: b.createdAt,
      dateModified: b.updatedAt,
    })),
  };

  const heading = (
    <>
      <p className="eyebrow">HB Softweb · Journal</p>
      <h1 className="hero-title stage-title"><SplitWords text="Ideas, guides & stories from the web." /></h1>
    </>
  );

  return (
    <main>
      <JsonLd data={structuredData} />
      <SceneBackdrop variant="home" />
      {blogs.length === 0 ? (
        <section className="container empty-stage">
          {heading}
          <div className="empty">No blogs published yet.</div>
        </section>
      ) : (
        <>
          <BlogStage blogs={blogs}>{heading}</BlogStage>
          <ArticleGrid blogs={blogs} />
        </>
      )}
    </main>
  );
}
