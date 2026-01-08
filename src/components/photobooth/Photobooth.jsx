import React, { useCallback, useEffect, useRef, useState } from "react";

const TAKE_COUNT = 3;

export default function Photobooth() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [permission, setPermission] = useState("unknown"); // unknown | granted | denied
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("denied");
      setError("Browser tidak mendukung akses kamera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission("granted");
    } catch (err) {
      setPermission("denied");
      setError("Izin kamera ditolak atau diblokir. Cek permission browser/OS.");
    }
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setPhotos((prev) => (prev.length >= TAKE_COUNT ? prev : [...prev, dataUrl]));
  }, []);

  useEffect(() => stopStream, [stopStream]);

  return (
    <section className="w-full bg-bgPrimary py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-l text-textDark">Photobooth</h2>
          <p className="mt-2 text-caption text-textMuted">
            Prototype sederhana: izin kamera, preview, dan ambil foto.
          </p>
        </div>

        <div className="mt-10 grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-subtle bg-bgSurface shadow-sm">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {permission !== "granted" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                  Camera off
                </div>
              )}
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <img
                    key={`shot-${i}`}
                    src={src}
                    alt={`shot-${i + 1}`}
                    className="aspect-[3/4] w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-subtle bg-white p-6 shadow-sm">
              <p className="text-caption text-textMuted">Status</p>
              <p className="mt-1 text-caption text-textSecondary">
                {permission === "granted" ? "Camera on" : "Camera off"}
              </p>

              {error && (
                <div className="mt-4 rounded-2xl border border-subtle bg-bgSurface p-4 text-caption text-textSecondary">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={requestCamera}
                  className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                >
                  Minta Akses Kamera
                </button>
                <button
                  type="button"
                  onClick={takePhoto}
                  disabled={permission !== "granted" || photos.length >= TAKE_COUNT}
                  className={[
                    "rounded-md border px-4 py-3 text-base",
                    permission === "granted" && photos.length < TAKE_COUNT
                      ? "border-subtle bg-white text-textPrimary"
                      : "border-subtle bg-bgSurface text-textMuted",
                  ].join(" ")}
                >
                  Ambil Foto ({photos.length}/{TAKE_COUNT})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotos([]);
                    stopStream();
                    setPermission("unknown");
                  }}
                  className="rounded-md border border-subtle bg-white px-4 py-3 text-base text-textPrimary"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
}
