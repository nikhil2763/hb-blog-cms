// Re-mounts on every navigation so each page fades in. Opacity only: a transform here would break the fixed 3D backdrop.
export default function Template({ children }) {
  return <div className="page-transition">{children}</div>;
}
