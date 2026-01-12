import { CameraOff } from "lucide-react";
import React from "react";

export default function CameraPreview({
  videoRef,
  canvasRef,
  permission,
  countdown,
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-[0_20px_60px_rgba(255,192,203,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fff4f8,transparent_55%)]" />
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <div className="relative flex w-full justify-center px-2 py-2 sm:px-0">
        <canvas
          ref={canvasRef}
          className="block h-auto w-full max-w-[92vw] rounded-[24px] shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:max-w-[680px]"
          style={{ aspectRatio: "716 / 538" }}
        />
      </div>
      {permission !== "granted" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-pink-500 flex-col gap-4 text-center px-8">
          <CameraOff size={64}/>
          Kamera belum aktif (Klik tombol di kanan untuk menyalakan kamera.)
        </div>
      )}
      {permission === "granted" && countdown && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20 text-2xl font-bold text-white shadow-lg">
            {countdown}
          </div>
        </div>
      )}
    </div>
  );
}
