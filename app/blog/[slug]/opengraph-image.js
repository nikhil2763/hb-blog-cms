import { ImageResponse } from "next/og";
import { getBlogBySlug } from "@/lib/blogService";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post cover";

// Auto-generated social preview image for each post.
export default async function Image({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug).catch(() => null);
  const title = blog?.title || SITE_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "radial-gradient(circle at 80% 20%, #7c3aed 0%, #1e1b4b 45%, #0b0a1a 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#67e8f9", letterSpacing: 6 }}>HB SOFTWEB · BLOG</div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 58 : 72, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 26, color: "#c4b5fd" }}>{SITE_NAME}</div>
      </div>
    ),
    size
  );
}
