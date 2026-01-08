// src/components/photobooth/Photobooth.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";

/**
 * NOTE (install):
 * npm i react-webcam
 *
 * UX FLOW:
 * intro -> camera -> capturing(3x) -> results -> (retake single | retake all) -> download
 */

const COUNTDOWN_OPTIONS = [3, 5, 7];
const FRAME_COLORS = {
  red: { label: "Red", hex: "#EF4444" },
  green: { label: "Green", hex: "#22C55E" },
  blue: { label: "Blue", hex: "#3B82F6" },
};

const FIXED_TAKES = 3;

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatDateStamp(d = new Date()) {
  // en-GB: dd/mm/yyyy
  return d.toLocaleDateString("en-GB");
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // dataURL doesn’t need crossOrigin, but harmless
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// object-cover crop onto canvas rect
function drawCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export default function Photobooth() {
  const webcamRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const [state, setState] = useState("intro"); // intro | camera | capturing | retake | results
  const [error, setError] = useState(null);

  const [countdownSec, setCountdownSec] = useState(3);
  const [frameKey, setFrameKey] = useState("blue");

  const [photos, setPhotos] = useState([]); // dataURLs length 0..3
  const [countdownDisplay, setCountdownDisplay] = useState(null);
  const [flash, setFlash] = useState(false);
  const [progress, setProgress] = useState(0);

  const [retakeIndex, setRetakeIndex] = useState(null);

  const frameHex = FRAME_COLORS[frameKey].hex;

  const controlsLocked = state === "capturing" || state === "retake";

  const statusLabel = useMemo(() => {
    if (state === "camera") return "Camera on";
    if (state === "capturing") return `Capturing ${progress}/${FIXED_TAKES}`;
    if (state === "retake") return `Retake photo ${retakeIndex + 1}`;
    if (state === "results") return "Results";
    return "Camera off";
  }, [state, progress, retakeIndex]);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const runCountdown = useCallback(
    (seconds) =>
      new Promise((resolve) => {
        clearCountdownTimer();
        let counter = seconds;
        setCountdownDisplay(counter);

        countdownTimerRef.current = setInterval(() => {
          counter -= 1;
          if (counter <= 0) {
            clearCountdownTimer();
            setCountdownDisplay(null);
            resolve();
          } else {
            setCountdownDisplay(counter);
          }
        }, 1000);
      }),
    [clearCountdownTimer]
  );

  const flashOnce = useCallback(async () => {
    setFlash(true);
    await wait(140);
    setFlash(false);
  }, []);

  const openCamera = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser/device ini tidak support akses kamera (getUserMedia). Coba Chrome/Safari terbaru.");
      return;
    }

    try {
      // Trigger permission dialog explicitly on user gesture (mobile-friendly)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      stream.getTracks().forEach((track) => track.stop());
      setState("camera");
    } catch (err) {
      setError("Izin kamera ditolak/blocked. Cek permission browser + OS, lalu reload.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    clearCountdownTimer();
    setCountdownDisplay(null);
    setFlash(false);
    setProgress(0);
    setRetakeIndex(null);
    setState("intro");
    // react-webcam akan stop stream sendiri saat unmount
  }, [clearCountdownTimer]);

  const getShot = useCallback(() => {
    // IMPORTANT: jangan baca ref di render. ini event handler -> aman
    const cam = webcamRef.current;
    if (!cam) return null;
    const dataUrl = cam.getScreenshot?.();
    return dataUrl || null;
  }, []);

  const startCaptureSequence = useCallback(async () => {
    setError(null);
    setProgress(0);
    setState("capturing");

    const shots = [];

    for (let i = 0; i < FIXED_TAKES; i += 1) {
      await runCountdown(countdownSec);
      await flashOnce();

      const shot = getShot();
      if (!shot) {
        setError("Kamera belum ready / permission belum di-allow. Coba reload & allow camera ya.");
        setState("camera");
        setProgress(0);
        return;
      }

      shots.push(shot);
      setProgress(i + 1);

      // jeda dikit biar ga kerasa spammy
      await wait(180);
    }

    setPhotos(shots);
    setState("results");
  }, [countdownSec, flashOnce, getShot, runCountdown]);

  const retakeSingle = useCallback(
    async (index) => {
      setError(null);
      setRetakeIndex(index);
      setState("retake");

      await runCountdown(countdownSec);
      await flashOnce();

      const shot = getShot();
      if (!shot) {
        setError("Retake gagal (kamera belum ready). Coba allow camera dulu.");
        setState("camera");
        setRetakeIndex(null);
        return;
      }

      setPhotos((prev) => {
        const next = [...prev];
        next[index] = shot;
        return next;
      });

      setRetakeIndex(null);
      setState("results");
    },
    [countdownSec, flashOnce, getShot, runCountdown]
  );

  const retakeAll = useCallback(() => {
    clearCountdownTimer();
    setCountdownDisplay(null);
    setFlash(false);
    setProgress(0);
    setRetakeIndex(null);
    setPhotos([]);
    setState("camera");
  }, [clearCountdownTimer]);

  const downloadStrip = useCallback(async () => {
    if (photos.length !== FIXED_TAKES) return;

    // HD output
    const W = 900;
    const H = 1600;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameSize = 26;
    const gap = 16;

    const innerX = frameSize;
    const innerY = frameSize;
    const innerW = W - frameSize * 2;
    const innerH = H - frameSize * 2;

    // outer frame
    ctx.fillStyle = frameHex;
    ctx.fillRect(0, 0, W, H);

    // inner paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(innerX, innerY, innerW, innerH);

    const availableH = innerH - gap * (FIXED_TAKES - 1) - 60; // space for timestamp
    const photoH = Math.floor(availableH / FIXED_TAKES);
    const photoW = innerW;

    // load + draw photos
    const imgs = await Promise.all(photos.map((src) => loadImage(src)));

    imgs.forEach((img, i) => {
      const x = innerX;
      const y = innerY + i * (photoH + gap);
      drawCover(ctx, img, x, y, photoW, photoH);
      // subtle rounded mask feel (fake): overlay border
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, photoW - 2, photoH - 2);
    });

    // timestamp
    ctx.fillStyle = "#6b7280";
    ctx.font = "24px Inter, system-ui, sans-serif";
    ctx.fillText(formatDateStamp(), innerX + 10, H - frameSize - 14);

    // download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "photostrip.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [frameHex, photos]);

  useEffect(() => {
    return () => {
      clearCountdownTimer();
    };
  }, [clearCountdownTimer]);

  return (
    <section className="w-full bg-bgPrimary py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-l text-textDark">Photobooth</h2>
          <p className="mt-2 text-caption text-textMuted">
            Take 3 pics. Pick a frame. Download.
          </p>
        </div>

        <div className="mt-10 grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: preview / results */}
          <div className="flex flex-col gap-6">
            {error && (
              <div className="rounded-2xl border border-subtle bg-bgSurface p-4 text-caption text-textSecondary">
                {error}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      if (state === "intro") openCamera();
                    }}
                    className="rounded-md border border-subtle bg-white px-4 py-2 text-caption text-textPrimary"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {state === "intro" && !error && (
              <div className="rounded-3xl border border-subtle bg-white p-6 shadow-sm">
                <p className="text-base text-textPrimary">
                  Ready? Open camera dulu, nanti otomatis ambil 3 foto.
                </p>
              </div>
            )}

            {(state === "camera" || state === "capturing" || state === "retake") && (
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-subtle bg-bgSurface shadow-sm">
                {/* Webcam mounted only when camera states -> permission prompt happens here */}
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.92}
                  mirrored
                  playsInline
                  videoConstraints={{
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  }}
                  className="h-full w-full object-cover"
                  onUserMediaError={() =>
                    setError(
                      "Kamera gagal kebaca. Pastiin allow camera + buka di http://localhost (atau HTTPS kalau deploy)."
                    )
                  }
                />

                {/* flash */}
                {flash && <div className="absolute inset-0 bg-white/70" />}

                {/* countdown overlay */}
                {countdownDisplay && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[clamp(42px,9vw,78px)] font-heading font-extrabold text-white drop-shadow">
                      {countdownDisplay}
                    </span>
                  </div>
                )}

                {/* progress pill */}
                {(state === "capturing" || state === "retake") && (
                  <div className="absolute bottom-4 right-4 rounded-full bg-white/85 px-3 py-1 text-caption text-textSecondary">
                    {state === "retake" ? `retake ${retakeIndex + 1}/3` : `${progress}/3`}
                  </div>
                )}
              </div>
            )}

            {state === "results" && (
              <div className="flex flex-col gap-4">
                {/* photostrip preview */}
                <div
                  className="aspect-[3/4] w-full overflow-hidden rounded-3xl border shadow-sm"
                  style={{ borderColor: frameHex }}
                >
                  <div className="flex h-full flex-col gap-3 bg-white p-4">
                    {photos.map((src, i) => (
                      <img
                        key={`strip-${i}`}
                        src={src}
                        alt={`photo-${i + 1}`}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                </div>

                {/* thumbs retake */}
                <div className="flex items-center justify-center gap-3">
                  {photos.map((src, i) => (
                    <button
                      key={`thumb-${i}`}
                      type="button"
                      onClick={() => retakeSingle(i)}
                      className="group h-16 w-16 overflow-hidden rounded-xl border border-subtle"
                      title="Tap to retake"
                    >
                      <img
                        src={src}
                        alt={`thumb-${i + 1}`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>

                <p className="text-center text-caption text-textMuted">
                  tip: tap thumbnail buat retake 1 foto.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: controls */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-subtle bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-caption text-textMuted">Status</p>
                <span className="text-caption text-textSecondary">{statusLabel}</span>
              </div>

              <div className="mt-6 flex flex-col gap-5">
                {/* countdown */}
                <div>
                  <p className="text-caption text-textMuted">Countdown</p>
                  <div className="mt-2 flex items-center gap-2">
                    {COUNTDOWN_OPTIONS.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        disabled={controlsLocked}
                        onClick={() => setCountdownSec(sec)}
                        className={[
                          "rounded-md border px-3 py-1 text-caption transition",
                          controlsLocked
                            ? "border-subtle text-textMuted"
                            : "border-subtle text-textSecondary hover:text-textPrimary",
                          countdownSec === sec ? "bg-blueSoft text-textPrimary" : "bg-white",
                        ].join(" ")}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* frame */}
                <div>
                  <p className="text-caption text-textMuted">Frame</p>
                  <div className="mt-2 flex items-center gap-2">
                    {Object.keys(FRAME_COLORS).map((key) => (
                      <button
                        key={key}
                        type="button"
                        disabled={controlsLocked || state === "intro"}
                        onClick={() => setFrameKey(key)}
                        className={[
                          "h-9 w-9 rounded-full border transition",
                          controlsLocked || state === "intro"
                            ? "border-subtle opacity-60"
                            : "border-subtle hover:scale-105",
                          frameKey === key ? "ring-2 ring-textPrimary" : "ring-0",
                        ].join(" ")}
                        style={{ backgroundColor: FRAME_COLORS[key].hex }}
                        aria-label={FRAME_COLORS[key].label}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-bgSurface p-4 text-caption text-textSecondary">
                  Fixed: <span className="font-semibold">3 photos</span>. Countdown bisa kamu atur.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {state === "intro" && (
                <button
                  type="button"
                  onClick={openCamera}
                  className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                >
                  Open Camera
                </button>
              )}

              {state === "camera" && (
                <>
                  <button
                    type="button"
                    onClick={startCaptureSequence}
                    className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                  >
                    Start (3 photos)
                  </button>
                  <button
                    type="button"
                    onClick={closeCamera}
                    className="rounded-md border border-subtle bg-white px-4 py-3 text-base text-textPrimary"
                  >
                    Close camera
                  </button>
                </>
              )}

              {(state === "capturing" || state === "retake") && (
                <div className="rounded-md border border-subtle bg-white px-4 py-3 text-caption text-textMuted">
                  Capturing... stay still
                </div>
              )}

              {state === "results" && (
                <>
                  <button
                    type="button"
                    onClick={downloadStrip}
                    className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={retakeAll}
                    className="rounded-md border border-subtle bg-white px-4 py-3 text-base text-textPrimary"
                  >
                    Retake all
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
