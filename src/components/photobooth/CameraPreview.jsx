import { CameraOff } from "lucide-react";
import React from "react";

export default function CameraPreview({
  videoRef,
  permission,
  countdown,
  aspectRatio,
  containerRef,
}) {
  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_20px_60px_rgba(255,192,203,0.35)]"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff4f8,transparent_55%)]" />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="relative h-auto w-full object-cover [transform:scaleX(-1)]"
      />
      {permission !== "granted" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-pink-500 flex-col gap-4 text-center px-8">
          <CameraOff size={64}/>
          Kamera belum aktif (Klik tombol di kanan untuk menyalakan kamera.)
        </div>
      )}
      {permission === "granted" && countdown && (
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-base font-bold text-white shadow-md">
          {countdown}
        </div>
      )}
    </div>
  );
}
