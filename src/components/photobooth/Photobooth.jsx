import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COUNTDOWN_OPTIONS = [3, 5, 7];
const FRAME_COLORS = {
  red: "#EF4444",
  green: "#22C55E",
  blue: "#3B82F6",
};

function usePhotobooth() {
  const [state, setState] = useState("intro");
  const [countdownSec, setCountdownSec] = useState(3);
  const [frameColor, setFrameColor] = useState("blue");
  const [photos, setPhotos] = useState([]);
  const [activeRetakeIndex, setActiveRetakeIndex] = useState(null);
  const [error, setError] = useState(null);
  const [countdownDisplay, setCountdownDisplay] = useState(null);
  const [flash, setFlash] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureCanvasRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const openCamera = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Device ini tidak mendukung kamera.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("camera");
    } catch (err) {
      setError("Kamera belum diizinin. Coba allow ya.");
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopStream();
    setState("intro");
    setCountdownDisplay(null);
    setProgress(0);
  }, [stopStream]);

  const drawCover = useCallback((ctx, img, x, y, w, h) => {
    const { width: iw, height: ih } = img;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return null;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 1600;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const framePadding = 18;
    const contentX = framePadding;
    const contentY = framePadding;
    const contentW = canvas.width - framePadding * 2;
    const contentH = canvas.height - framePadding * 2;

    drawCover(ctx, video, contentX, contentY, contentW, contentH);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [drawCover]);

  const runCountdown = useCallback(
    async (seconds) =>
      new Promise((resolve) => {
        let counter = seconds;
        setCountdownDisplay(counter);
        const timer = setInterval(() => {
          counter -= 1;
          if (counter <= 0) {
            clearInterval(timer);
            setCountdownDisplay(null);
            resolve();
          } else {
            setCountdownDisplay(counter);
          }
        }, 1000);
      }),
    []
  );

  const flashOnce = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  }, []);

  const startCaptureSequence = useCallback(async () => {
    if (!videoRef.current) return;
    setState("capturing");
    setProgress(0);
    const newPhotos = [];
    for (let i = 0; i < 3; i += 1) {
      await runCountdown(countdownSec);
      flashOnce();
      const shot = captureFrame();
      if (shot) newPhotos.push(shot);
      setProgress(i + 1);
    }
    setPhotos(newPhotos);
    setState("results");
  }, [captureFrame, countdownSec, flashOnce, runCountdown]);

  const retakeSingle = useCallback(
    async (index) => {
      setActiveRetakeIndex(index);
      setState("retake");
      await runCountdown(countdownSec);
      flashOnce();
      const shot = captureFrame();
      if (shot) {
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index] = shot;
          return updated;
        });
      }
      setActiveRetakeIndex(null);
      setState("results");
    },
    [captureFrame, countdownSec, flashOnce, runCountdown]
  );

  const retakeAll = useCallback(() => {
    setPhotos([]);
    setProgress(0);
    setState("camera");
  }, []);

  const downloadStrip = useCallback(() => {
    if (photos.length !== 3) return;
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    const frame = FRAME_COLORS[frameColor];
    const frameSize = 24;
    const gap = 16;
    const availableH = canvas.height - frameSize * 2 - gap * 2;
    const photoH = Math.floor(availableH / 3);
    const photoW = canvas.width - frameSize * 2;

    ctx.fillStyle = frame;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      frameSize,
      frameSize,
      canvas.width - frameSize * 2,
      canvas.height - frameSize * 2
    );

    const drawImageToStrip = (imgSrc, i) => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        const x = frameSize;
        const y = frameSize + i * (photoH + gap);
        drawCover(ctx, img, x, y, photoW, photoH);

        if (i === 2) {
          ctx.fillStyle = "#6b7280";
          ctx.font = "24px Inter, sans-serif";
          const now = new Date();
          const stamp = now.toLocaleDateString("en-GB");
          ctx.fillText(
            stamp,
            frameSize + 10,
            canvas.height - frameSize - 12
          );

          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "photostrip.png";
            link.click();
            URL.revokeObjectURL(url);
          }, "image/png");
        }
      };
    };

    photos.forEach((src, i) => drawImageToStrip(src, i));
  }, [drawCover, frameColor, photos]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    state,
    countdownSec,
    frameColor,
    photos,
    progress,
    countdownDisplay,
    flash,
    activeRetakeIndex,
    error,
    videoRef,
    captureCanvasRef,
    setCountdownSec,
    setFrameColor,
    openCamera,
    closeCamera,
    startCaptureSequence,
    retakeSingle,
    retakeAll,
    downloadStrip,
  };
}

function CountdownSelector({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      {COUNTDOWN_OPTIONS.map((sec) => (
        <button
          key={sec}
          type="button"
          disabled={disabled}
          onClick={() => onChange(sec)}
          className={[
            "rounded-md border px-3 py-1 text-caption",
            disabled
              ? "border-subtle text-textMuted"
              : "border-subtle text-textSecondary hover:text-textPrimary",
            value === sec ? "bg-blueSoft text-textPrimary" : "bg-white",
          ].join(" ")}
        >
          {sec}s
        </button>
      ))}
    </div>
  );
}

function FrameSelector({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      {Object.entries(FRAME_COLORS).map(([key, color]) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onChange(key)}
          className={[
            "h-9 w-9 rounded-full border",
            disabled ? "border-subtle" : "border-subtle hover:scale-105",
            value === key ? "ring-2 ring-textPrimary" : "ring-0",
          ].join(" ")}
          style={{ backgroundColor: color }}
          aria-label={key}
        />
      ))}
    </div>
  );
}

function CameraPreview({ videoRef, countdownDisplay, flash, progress }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-subtle bg-bgSurface shadow-sm">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />
      {flash && (
        <div className="absolute inset-0 bg-white/70 transition-opacity" />
      )}
      {countdownDisplay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[clamp(36px,8vw,72px)] font-heading font-bold text-white drop-shadow">
            {countdownDisplay}
          </span>
        </div>
      )}
      {progress > 0 && (
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-caption text-textSecondary">
          {progress}/3
        </div>
      )}
    </div>
  );
}

function ResultsPreview({ photos, frameColor, onRetake }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div
        className="aspect-[3/4] w-full overflow-hidden rounded-3xl border border-subtle shadow-sm"
        style={{ borderColor: FRAME_COLORS[frameColor] }}
      >
        <div className="flex h-full flex-col gap-3 bg-white p-4">
          {photos.map((src, index) => (
            <img
              key={`strip-${index}`}
              src={src}
              alt={`photobooth-${index + 1}`}
              className="h-full w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        {photos.map((src, index) => (
          <button
            key={`thumb-${index}`}
            type="button"
            onClick={() => onRetake(index)}
            className="h-16 w-16 overflow-hidden rounded-xl border border-subtle"
          >
            <img
              src={src}
              alt={`thumbnail-${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Photobooth() {
  const booth = usePhotobooth();
  const isCapturing = booth.state === "capturing" || booth.state === "retake";
  const controlsDisabled =
    booth.state === "capturing" || booth.state === "retake";

  const statusLabel = useMemo(() => {
    if (booth.state === "camera") return "Camera on";
    if (booth.state === "results") return "Results";
    if (booth.state === "retake") return "Retake photo";
    return "Camera off";
  }, [booth.state]);

  return (
    <section className="w-full bg-bgPrimary py-14 sm:py-20">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-l text-textDark">Photobooth</h2>
          <p className="mt-2 text-caption text-textMuted">
            Take 3 pics. Pick a frame. Download.
          </p>
        </div>

        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            {booth.error && (
              <div className="rounded-2xl border border-subtle bg-bgSurface p-4 text-caption text-textSecondary">
                {booth.error}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={booth.openCamera}
                    className="rounded-md border border-subtle bg-white px-4 py-2 text-caption text-textPrimary"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {booth.state === "intro" && !booth.error && (
              <div className="rounded-3xl border border-subtle bg-white p-6 shadow-sm">
                <p className="text-base text-textPrimary">
                  Ready? Open the camera to start your photobooth.
                </p>
              </div>
            )}

            {booth.state !== "intro" && (
              <CameraPreview
                videoRef={booth.videoRef}
                countdownDisplay={booth.countdownDisplay}
                flash={booth.flash}
                progress={booth.progress}
              />
            )}

            {booth.state === "results" && (
              <ResultsPreview
                photos={booth.photos}
                frameColor={booth.frameColor}
                onRetake={booth.retakeSingle}
              />
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-subtle bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-caption text-textMuted">Status</p>
                <span className="text-caption text-textSecondary">
                  {statusLabel}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <p className="text-caption text-textMuted">Countdown</p>
                  <CountdownSelector
                    value={booth.countdownSec}
                    onChange={booth.setCountdownSec}
                    disabled={controlsDisabled}
                  />
                </div>

                <div>
                  <p className="text-caption text-textMuted">Frame</p>
                  <FrameSelector
                    value={booth.frameColor}
                    onChange={booth.setFrameColor}
                    disabled={controlsDisabled || booth.state === "intro"}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {booth.state === "intro" && (
                <button
                  type="button"
                  onClick={booth.openCamera}
                  className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                >
                  Open Camera
                </button>
              )}

              {booth.state === "camera" && (
                <>
                  <button
                    type="button"
                    onClick={booth.startCaptureSequence}
                    className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                  >
                    Start (3 photos)
                  </button>
                  <button
                    type="button"
                    onClick={booth.closeCamera}
                    className="rounded-md border border-subtle bg-white px-4 py-3 text-base text-textPrimary"
                  >
                    Close camera
                  </button>
                </>
              )}

              {(booth.state === "capturing" || booth.state === "retake") && (
                <div className="rounded-md border border-subtle bg-white px-4 py-3 text-caption text-textMuted">
                  Capturing... stay still
                </div>
              )}

              {booth.state === "results" && (
                <>
                  <button
                    type="button"
                    onClick={booth.downloadStrip}
                    className="rounded-md bg-textDark px-4 py-3 text-base text-white"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={booth.retakeAll}
                    className="rounded-md border border-subtle bg-white px-4 py-3 text-base text-textPrimary"
                  >
                    Retake all
                  </button>
                  <p className="text-caption text-textMuted">
                    Tip: tap photo to retake.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <canvas ref={booth.captureCanvasRef} className="hidden" />
      </div>
    </section>
  );
}
