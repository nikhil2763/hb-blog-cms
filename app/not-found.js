import Link from "next/link";
import SceneBackdrop from "@/components/SceneBackdrop";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="container not-found">
      <SceneBackdrop variant="notfound" />
      <p className="sr-only">Error 404</p>
      <h1>We couldn&apos;t find that page</h1>
      <p className="muted">The blog you&apos;re looking for may have been moved or deleted.</p>
      <Link href="/blog" className="btn btn-primary">Back to all blogs</Link>
    </main>
  );
}
