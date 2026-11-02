"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/Toaster";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    toast.info("You have been logged out.");
    router.replace("/admin/login");
  };

  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={logout} disabled={busy}>
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}
