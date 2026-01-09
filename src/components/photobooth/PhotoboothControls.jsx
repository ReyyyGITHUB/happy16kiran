import { CameraIcon, CameraOffIcon } from "lucide-react";
import React from "react";

export default function PhotoboothControls({
  permission,
  error,
  photosCount,
  maxPhotos,
  delaySec,
  isTaking,
  stage,
  onRequestCamera,
  onSelectDelay,
  onTakePhoto,
  onProceed,
  onReset,
}) {
  const DELAY_OPTIONS = [3, 5, 8];

  return (
    <div className="rounded-[28px] border border-pink-100 bg-white p-6 shadow-[0_20px_60px_rgba(255,192,203,0.35)]">
      <div className="flex items-center justify-between">
        <p className="text-caption text-pink-500">Status</p>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold",
            permission === "granted"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-pink-50 text-pink-500",
          ].join(" ")}
        >
          {permission === "granted" ? "Kamera aktif" : "Kamera nonaktif"}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-caption text-pink-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {permission !== "granted" && (
          <div className="rounded-2xl border border-pink-100 flex flex-col bg-[#ffeaf2] p-4">
            <p className="text-caption text-pink-600 ">
              Klik tombol di bawah untuk mengizinkan akses kamera.
            </p>
            <button
              type="button"
              onClick={onRequestCamera}
              className="mt-4 w-full rounded-sm bg-pink px-6 py-4 text-base font-bold tracking-wide text-white shadow-lg shadow-pink-200 flex flex-row items-center justify-center gap-2"
            >
              <CameraOffIcon />
              Aktifkan Kamera
            </button>
          </div>
        )}

        <div>
          <p className="text-caption text-pink-500">Jeda antar foto</p>
          <div className="mt-2 flex items-center gap-2">
            {DELAY_OPTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onSelectDelay(sec)}
                className={[
                  "rounded-full border px-4 py-1 transition",
                  delaySec === sec
                    ? "border-pink-500 bg-pink-500 text-white"
                    : "border-pink-100 bg-white text-pink-500 hover:border-pink-300",
                ].join(" ")}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onTakePhoto}
          disabled={
            permission !== "granted" || photosCount >= maxPhotos || isTaking
          }
          className={[
            "rounded-xl border px-4 py-3 text-base font-semibold transition",
            permission === "granted" && photosCount < maxPhotos && !isTaking
              ? "border-pink-200 bg-white text-pink-600 hover:bg-pink-50"
              : "border-pink-100 bg-pink-50 text-pink-300",
          ].join(" ")}
        >
          {isTaking
            ? "Siap-siap..."
            : `Ambil Foto (${photosCount}/${maxPhotos})`}
        </button>
        {stage === "capture" && photosCount >= maxPhotos && (
          <button
            type="button"
            onClick={onProceed}
            disabled={isTaking}
            className={[
              "rounded-xl px-4 py-3 text-base font-semibold",
              !isTaking
                ? "bg-pink-500 text-white"
                : "bg-pink-100 text-pink-300",
            ].join(" ")}
          >
            Berikutnya: pilih frame
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-pink-100 bg-white px-4 py-3 text-base text-pink-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
