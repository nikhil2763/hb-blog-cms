"use client";

export default function Error({ reset }) {
  return (
    <main className="container not-found">
      <p className="nf-code">!</p>
      <h1>Something went wrong</h1>
      <p className="muted">We couldn&apos;t load this page. Please check the database connection and try again.</p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </main>
  );
}
