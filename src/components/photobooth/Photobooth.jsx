import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraPreview from "./CameraPreview";
import PhotoboothControls from "./PhotoboothControls";
import PhotoGrid from "./PhotoGrid";
import FrameSelector from "./FrameSelector";
import { Upload } from "lucide-react";

const TAKE_COUNT = 3;
const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const PHOTO_AREA_HEIGHT = 1700;
const SLOT_GAP = 20;
const SLOT_PADDING_X = 90;
const SLOT_PADDING_TOP = 100;
const SLOT_WIDTH = FRAME_WIDTH - SLOT_PADDING_X * 2;
const SLOT_HEIGHT = (PHOTO_AREA_HEIGHT - SLOT_PADDING_TOP - SLOT_GAP * 2) / 3;
const SLOT_ASPECT = SLOT_WIDTH / SLOT_HEIGHT;
const FRAME_OPTIONS = [
  {
    id: "blush",
    name: "Blush",
    label: "Soft pink",
    border: "#f472b6",
    preview: "linear-gradient(135deg,#fff1f6,#ffe4ef)",
  },
  {
    id: "film",
    name: "Film",
    label: "Classic strip",
    border: "#111827",
    preview: "linear-gradient(135deg,#0f172a,#111827)",
  },
  {
    id: "mint",
    name: "Mint",
    label: "Fresh teal",
    border: "#14b8a6",
    preview: "linear-gradient(135deg,#ecfeff,#ccfbf1)",
  },
  {
    id: "sunset",
    name: "Sunset",
    label: "Warm glow",
    border: "#fb923c",
    preview: "linear-gradient(135deg,#ffedd5,#fecdd3)",
  },
];

export default function Photobooth() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [permission, setPermission] = useState("unknown"); // unknown | granted | denied
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [delaySec, setDelaySec] = useState(3);
  const [isTaking, setIsTaking] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [stage, setStage] = useState("capture"); // capture | frame
  const [selectedFrameId, setSelectedFrameId] = useState("blush");
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
    canvas.width = SLOT_WIDTH;
    canvas.height = SLOT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;

    const imgRatio = img.width / img.height;
    const boxRatio = SLOT_ASPECT;
    let drawW = SLOT_WIDTH;
    let drawH = SLOT_HEIGHT;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > boxRatio) {
      drawH = SLOT_HEIGHT;
      drawW = SLOT_HEIGHT * imgRatio;
      offsetX = (SLOT_WIDTH - drawW) / 2;
    } else {
      drawW = SLOT_WIDTH;
      drawH = SLOT_WIDTH / imgRatio;
      offsetY = (SLOT_HEIGHT - drawH) / 2;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SLOT_WIDTH, SLOT_HEIGHT);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const getCoverCrop = (video, targetAspect) => {
    const srcW = video.videoWidth || 1280;
    const srcH = video.videoHeight || 720;
    const srcAspect = srcW / srcH;
    let sx = 0;
    let sy = 0;
    let sw = srcW;
    let sh = srcH;

    if (srcAspect > targetAspect) {
      sw = srcH * targetAspect;
      sx = (srcW - sw) / 2;
    } else {
      sh = srcW / targetAspect;
      sy = (srcH - sh) / 2;
    }

    return { sx, sy, sw, sh };
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

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
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

      const { sx, sy, sw, sh } = getCoverCrop(video, SLOT_ASPECT);
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);

      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.save();
      // Un-mirror captured photo
      ctx.scale(-1, 1);
      ctx.drawImage(
        video,
        sx,
        sy,
        sw,
        sh,
        -canvas.width,
        0,
        canvas.width,
        canvas.height
      );
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
    const canvas = canvasRef.current;
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

    const { sx, sy, sw, sh } = getCoverCrop(video, SLOT_ASPECT);
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      sx,
      sy,
      sw,
      sh,
      -canvas.width,
      0,
      canvas.width,
      canvas.height
    );
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
    setSelectedFrameId("blush");
    setFramedPhoto("");
    setSaveStatus("");
  }, [stopStream]);

  const buildFramedImage = useCallback(async (photoList, frameId) => {
    const frame = FRAME_OPTIONS.find((item) => item.id === frameId);
    if (!frame || photoList.length < TAKE_COUNT) return "";

    const images = await Promise.all(photoList.map((src) => loadImage(src)));

    const canvas = document.createElement("canvas");
    const width = FRAME_WIDTH;
    const height = FRAME_HEIGHT;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const drawCover = (img, x, y, w, h) => {
      const imgRatio = img.width / img.height;
      const boxRatio = w / h;
      let drawW = w;
      let drawH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > boxRatio) {
        drawH = h;
        drawW = h * imgRatio;
        offsetX = (w - drawW) / 2;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        offsetY = (h - drawH) / 2;
      }

      ctx.drawImage(img, x + offsetX, y + offsetY, drawW, drawH);
    };

    if (frame.id === "film") {
      ctx.fillStyle = "#0b0b0b";
      ctx.fillRect(0, 0, width, height);
    } else if (frame.id === "sunset") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#ffedd5");
      grad.addColorStop(1, "#fecdd3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (frame.id === "mint") {
      ctx.fillStyle = "#ecfeff";
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = "#fff1f6";
      ctx.fillRect(0, 0, width, height);
    }

    const photoAreaHeight = PHOTO_AREA_HEIGHT;
    const footerHeight = height - photoAreaHeight;
    const gap = SLOT_GAP;
    const slotWidth = SLOT_WIDTH;
    const slotHeight = SLOT_HEIGHT;

    images.forEach((img, idx) => {
      const x = SLOT_PADDING_X;
      const y = SLOT_PADDING_TOP + idx * (slotHeight + gap);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, slotWidth, slotHeight);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, slotWidth, slotHeight);
      ctx.clip();
      drawCover(img, x, y, slotWidth, slotHeight);
      ctx.restore();
    });

    if (frame.id === "film") {
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, photoAreaHeight, width, footerHeight);
      ctx.fillStyle = "#1f2937";
      for (let y = 70; y < height - 120; y += 120) {
        ctx.fillRect(16, y, 20, 60);
        ctx.fillRect(width - 36, y, 20, 60);
      }
    }

    ctx.strokeStyle = frame.border;
    ctx.lineWidth = 24;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    return canvas.toDataURL("image/png");
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

        <div className="mt-10 flex w-full flex-col gap-6 lg:grid lg:grid-cols-[220px_1fr_320px] lg:items-start">
          <div className="order-4 rounded-3xl border border-pink-100 bg-[#ffeaf2] p-5 text-center text-sm text-pink-600 shadow-sm lg:order-none">
            <p className="font-semibold">Tips</p>
            <p className="mt-2 text-pink-500">
              Cari cahaya yang terang agar hasil foto lebih jelas.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-pink-500 border flex flex-row gap-2 bg- w-full justify-center items-center p-4 rounded-full mt-4"
            >
              <Upload size={18}/>
              Unggah foto
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadPhotos}
            />
          </div>

          <div className="order-1 flex flex-col gap-6 lg:order-none">
            {stage === "capture" ? (
              <>
                <CameraPreview
                  videoRef={videoRef}
                  permission={permission}
                  countdown={countdown}
                  aspectRatio={SLOT_ASPECT}
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
                onRequestCamera={requestCamera}
                onSelectDelay={setDelaySec}
                onTakePhoto={takePhoto}
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

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
}
