"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";
import { toast } from "@/components/Toaster";

// onDeleted lets the table drop the row instantly; the refresh then updates the stats.
export default function DeleteButton({ id, title, onDeleted }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const handleDelete = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return router.replace("/admin/login");
      }
      if (!res.ok) throw new Error();
      toast.success(`“${title}” was deleted.`);
      setOpen(false);
      onDeleted?.(id);
      router.refresh();
    } catch {
      toast.error("Could not delete the blog. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>Delete</button>
      <ConfirmDialog
        open={open}
        title="Delete this blog?"
        message={<>“<strong>{title}</strong>” will be removed permanently and its page will stop working. This cannot be undone.</>}
        confirmLabel="Yes, delete"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={close}
      />
    </>
  );
}
