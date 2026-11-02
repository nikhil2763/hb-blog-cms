import { requireAdmin } from "@/lib/session";
import SceneBackdrop from "@/components/SceneBackdrop";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function CmsLayout({ children }) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <SceneBackdrop variant="admin" />
      <aside className="sidebar">
        <div className="side-brand">
          <span className="side-logo" aria-hidden="true">✦</span>
          <div>
            <strong>HB CMS</strong>
            <span className="muted">Blog manager</span>
          </div>
        </div>
        <AdminNav />
        <div className="side-user">
          <span className="avatar" aria-hidden="true">{String(admin.sub).slice(0, 1).toUpperCase()}</span>
          <div className="side-user-info">
            <strong>{admin.sub}</strong>
            <span className="muted">Administrator</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
