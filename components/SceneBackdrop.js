"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser; it sits fixed behind the page so the scene stays visible while scrolling.
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => null });

export default function SceneBackdrop({ variant = "home" }) {
  return (
    <div className="backdrop" aria-hidden="true">
      <Scene3D variant={variant} />
    </div>
  );
}
