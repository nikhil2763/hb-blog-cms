"use client";

import { useCallback, useEffect, useState } from "react";

// Tiny app-wide toast store: call toast.success("Saved") from any client component.
// <Toaster /> lives in the root layout, so toasts survive client-side navigation.
const listeners = new Set();
let nextId = 0;

function push(type, message, duration = 3800) {
  const item = { id: ++nextId, type, message, duration };
  listeners.forEach((listener) => listener(item));
  return item.id;
}

export const toast = {
  success: (message, duration) => push("success", message, duration),
  error: (message, duration) => push("error", message, duration ?? 5000),
  info: (message, duration) => push("info", message, duration),
};

const ICONS = { success: "✓", error: "!", info: "i" };

export default function Toaster() {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 320);
  }, []);

  useEffect(() => {
    const add = (item) => {
      setItems((list) => [...list.slice(-3), item]);
      setTimeout(() => dismiss(item.id), item.duration);
    };
    listeners.add(add);
    return () => listeners.delete(add);
  }, [dismiss]);

  return (
    <div className="toaster" aria-live="polite" aria-relevant="additions">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}${t.leaving ? " is-leaving" : ""}`} role={t.type === "error" ? "alert" : "status"}>
          <span className="toast-icon" aria-hidden="true">{ICONS[t.type]}</span>
          <p className="toast-msg">{t.message}</p>
          <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">×</button>
          <span className="toast-timer" style={{ animationDuration: `${t.duration}ms` }} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
