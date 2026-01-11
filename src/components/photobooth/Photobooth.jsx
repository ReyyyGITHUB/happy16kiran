import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraPreview from "./CameraPreview";
import PhotoboothControls from "./PhotoboothControls";
import PhotoGrid from "./PhotoGrid";
import FrameSelector from "./FrameSelector";
import { drawCover } from "../../utils/crop";
import { renderStrip } from "../../renderer/strip";

const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 3300;
const FRAME_BG_SOURCES = {
  hirono: "/assets/strip/cutnew-hirono-photostrip-1080x3300.png?v=1",
  greentheme: "/assets/strip/greentheme-photostrip-1080x3300.png?v=1",
};
const SLOTS = [
  { x: 80, y: 290, w: 920, h: 675 },
  { x: 80, y: 985, w: 920, h: 675 },
  { x: 80, y: 1680, w: 920, h: 675 },
  { x: 80, y: 2375, w: 920, h: 675 },
];
const TAKE_COUNT = SLOTS.length;
const PREVIEW_SIZE = { w: SLOTS[0].w, h: SLOTS[0].h };
const FRAME_OPTIONS = [
  {
    id: "hirono",
    name: "Hirono",
    label: "Character strip",
    border: "#111111",
    preview: FRAME_BG_SOURCES.hirono,
    previewType: "image",
  },
  {
    id: "greentheme",
    name: "GreenTheme",
    label: "Fresh green",
    border: "#16a34a",
    preview: FRAME_BG_SOURCES.greentheme,
    previewType: "image",
  },
];

export default function Photobooth() {
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRafRef = useRef(null);

  const [permission, setPermission] = useState("unknown"); // unknown | granted | denied
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [delaySec, setDelaySec] = useState(3);
  const [isTaking, setIsTaking] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [stage, setStage] = useState("capture"); // capture | frame
  const [selectedFrameId, setSelectedFrameId] = useState("hirono");
  const [framedPhoto, setFramedPhoto] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const cropToSlot = async (src) => {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = PREVIEW_SIZE.w;
    canvas.height = PREVIEW_SIZE.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, PREVIEW_SIZE.w, PREVIEW_SIZE.h);
    drawCover(ctx, img, 0, 0, PREVIEW_SIZE.w, PREVIEW_SIZE.h);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

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
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
      setPermission("granted");
    } catch {
      setPermission("denied");
      setError("Izin kamera ditolak atau diblokir. Cek permission browser/OS.");
    }
  }, []);

  const handleUploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      setError("File harus berupa gambar.");
      return;
    }

    setError("");
    const availableSlots = TAKE_COUNT - photos.length;
    if (availableSlots <= 0) {
      setError(`Maksimal ${TAKE_COUNT} foto.`);
      return;
    }

    const picked = imageFiles.slice(0, availableSlots);

    const dataUrls = await Promise.all(
      picked.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    const processed = await Promise.all(
      dataUrls.map((src) => cropToSlot(src))
    );

    setPhotos((prev) => [...prev, ...processed].slice(0, TAKE_COUNT));
    setPreviewIndex(null);
    setStage("capture");
  };

  const drawPreview = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    if (!video || !canvas || permission !== "granted") return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || PREVIEW_SIZE.w;
    const cssH = canvas.clientHeight || PREVIEW_SIZE.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.save();
    ctx.scale(-1, 1);
    drawCover(ctx, video, -cssW, 0, cssW, cssH);
    ctx.restore();

    previewRafRef.current = requestAnimationFrame(drawPreview);
  }, [permission]);

  useEffect(() => {
    cancelAnimationFrame(previewRafRef.current);
    if (permission === "granted") {
      previewRafRef.current = requestAnimationFrame(drawPreview);
    }
    return () => cancelAnimationFrame(previewRafRef.current);
  }, [drawPreview, permission]);

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    setIsTaking(true);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const runCountdown = async (seconds) => {
      for (let t = seconds; t > 0; t -= 1) {
        setCountdown(t);
        await wait(1000);
      }
      setCountdown(null);
    };

    for (let i = photos.length; i < TAKE_COUNT; i += 1) {
      await runCountdown(delaySec);

      canvas.width = PREVIEW_SIZE.w;
      canvas.height = PREVIEW_SIZE.h;

      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.save();
      ctx.scale(-1, 1);
      drawCover(ctx, video, -PREVIEW_SIZE.w, 0, PREVIEW_SIZE.w, PREVIEW_SIZE.h);
      ctx.restore();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

      setPhotos((prev) => (prev.length >= TAKE_COUNT ? prev : [...prev, dataUrl]));

      // Jeda antar foto biar user siap lagi
      if (i < TAKE_COUNT - 1) {
        await wait(1500);
      }
    }

    setIsTaking(false);
    setCountdown(null);
  };

  const retakeSingle = async (index) => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const runCountdown = async (seconds) => {
      for (let t = seconds; t > 0; t -= 1) {
        setCountdown(t);
        await wait(1000);
      }
      setCountdown(null);
    };

    setIsTaking(true);
    await runCountdown(delaySec);

    canvas.width = PREVIEW_SIZE.w;
    canvas.height = PREVIEW_SIZE.h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.scale(-1, 1);
    drawCover(ctx, video, -PREVIEW_SIZE.w, 0, PREVIEW_SIZE.w, PREVIEW_SIZE.h);
    ctx.restore();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setPhotos((prev) => {
      const next = [...prev];
      next[index] = dataUrl;
      return next;
    });

    setIsTaking(false);
    setCountdown(null);
    setPreviewIndex(null);
  };

  const resetAll = useCallback(() => {
    setPhotos([]);
    stopStream();
    setPermission("unknown");
    setIsTaking(false);
    setCountdown(null);
    setPreviewIndex(null);
    setStage("capture");
    setSelectedFrameId("hirono");
    setFramedPhoto("");
    setSaveStatus("");
  }, [stopStream]);

  const buildFramedImage = useCallback(async (photoList, frameId) => {
    if (photoList.length < TAKE_COUNT) return "";
    const overlaySrc = FRAME_BG_SOURCES[frameId] || FRAME_BG_SOURCES.hirono;
    return renderStrip({
      slots: SLOTS,
      photos: photoList,
      overlaySrc,
      width: FRAME_WIDTH,
      height: FRAME_HEIGHT,
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (stage !== "frame" || photos.length < TAKE_COUNT) {
      setFramedPhoto("");
      return undefined;
    }

    buildFramedImage(photos, selectedFrameId).then((dataUrl) => {
      if (isMounted) setFramedPhoto(dataUrl);
    });

    return () => {
      isMounted = false;
    };
  }, [buildFramedImage, photos, selectedFrameId, stage]);

  const handleDownload = () => {
    if (!framedPhoto) return;
    const link = document.createElement("a");
    link.href = framedPhoto;
    link.download = "photobooth.png";
    link.click();
  };

  const handleSave = () => {
    if (!framedPhoto) return;
    try {
      localStorage.setItem("photobooth:lastSave", framedPhoto);
      setSaveStatus("Tersimpan di perangkat.");
    } catch {
      setSaveStatus("Gagal menyimpan.");
    }
    setTimeout(() => setSaveStatus(""), 2500);
  };

  useEffect(() => stopStream, [stopStream]);

  return (
    <section className="w-full bg-[radial-gradient(circle_at_top,#ffe4ef,transparent_70%)] py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="text-center">
          <p className="text-caption text-[#f472b6]">Photobooth</p>
          <h2 className="mt-2 text-2xl font-semibold text-textDark sm:text-3xl">
            Ambil 3 foto lucu, pilih jeda, lalu simpan.
          </h2>
        </div>

        <div className="mt-10 flex w-full flex-col gap-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="order-1 flex flex-col gap-6 lg:order-none">
            {stage === "capture" ? (
              <>
                <CameraPreview
                  videoRef={videoRef}
                  canvasRef={previewCanvasRef}
                  permission={permission}
                  countdown={countdown}
                />
                <PhotoGrid photos={photos} onSelect={setPreviewIndex} />
              </>
            ) : (
              <FrameSelector
                frames={FRAME_OPTIONS}
                selectedFrameId={selectedFrameId}
                framedPhoto={framedPhoto}
                saveStatus={saveStatus}
                onSelectFrame={setSelectedFrameId}
                onDownload={handleDownload}
                onSave={handleSave}
                onBack={() => setStage("capture")}
              />
            )}
          </div>

          <div className="order-3 flex flex-col gap-6 lg:order-none">
            {stage === "capture" ? (
              <PhotoboothControls
                permission={permission}
                error={error}
                photosCount={photos.length}
                maxPhotos={TAKE_COUNT}
                delaySec={delaySec}
                isTaking={isTaking}
                stage={stage}
                uploadInputRef={fileInputRef}
                onRequestCamera={requestCamera}
                onSelectDelay={setDelaySec}
                onTakePhoto={takePhoto}
                onUploadClick={() => fileInputRef.current?.click()}
                onUploadChange={handleUploadPhotos}
                onProceed={() => setStage("frame")}
                onReset={resetAll}
              />
            ) : (
              <div className="rounded-[28px] border border-pink-100 bg-white p-6 text-sm text-pink-500 shadow-[0_20px_60px_rgba(255,192,203,0.35)]">
                <p className="text-caption text-pink-500">Status</p>
                <p className="mt-2 font-semibold text-pink-600">
                  Frame aktif: {selectedFrameId}
                </p>
                <p className="mt-3">
                  Pilih frame di panel kiri, lalu download atau save hasilnya.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("capture")}
                  className="mt-5 w-full rounded-xl border border-pink-100 bg-white px-4 py-3 text-base font-semibold text-pink-600"
                >
                  Kembali ambil foto
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="mt-3 w-full rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-base font-semibold text-pink-600"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {previewIndex !== null && photos[previewIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-[520px] rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-pink-600">
                  Preview foto {previewIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(null)}
                  className="rounded-full border border-pink-100 px-3 py-1 text-xs text-pink-600"
                >
                  Tutup
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-pink-100">
                <img
                  src={photos[previewIndex]}
                  alt={`preview-${previewIndex + 1}`}
                  className="w-full object-contain"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => retakeSingle(previewIndex)}
                  disabled={permission !== "granted" || isTaking}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold",
                    permission === "granted" && !isTaking
                      ? "bg-pink-500 text-white"
                      : "bg-pink-100 text-pink-300",
                  ].join(" ")}
                >
                  Take ulang
                </button>
                <span className="text-xs text-pink-500">
                  Kamera harus aktif untuk retake.
                </span>
              </div>
            </div>
          </div>
        )}

        <canvas ref={captureCanvasRef} className="hidden" />
      </div>
    </section>
  );
}
