import React from "react";

export default function FrameSelector({
  frames,
  selectedFrameId,
  framedPhoto,
  saveStatus,
  onSelectFrame,
  onDownload,
  onSave,
  onBack,
}) {
  return (
    <div className="rounded-[28px] border border-pink-100 bg-white p-6 shadow-[0_20px_60px_rgba(255,192,203,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-caption text-pink-500">Pilih frame</p>
          <h3 className="mt-1 text-lg font-semibold text-textDark">
            Pilih gaya bingkai untuk hasil akhir.
          </h3>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-pink-100 px-4 py-2 text-xs font-semibold text-pink-600"
        >
          Kembali ambil foto
        </button>
      </div>

      <div className="mt-5 mx-auto w-full max-w-[260px] overflow-hidden rounded-[2px] border border-pink-100 bg-[#ffdbe7] shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        {framedPhoto ? (
          <img
            src={framedPhoto}
            alt="Hasil frame"
            className="w-full object-contain"
          />
        ) : (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-pink-400">
            Menyiapkan preview frame...
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {frames.map((frame) => {
          const isActive = frame.id === selectedFrameId;
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onSelectFrame(frame.id)}
              className={[
                "rounded-2xl border p-3 text-left transition",
                isActive
                  ? "border-pink-400 bg-pink-50"
                  : "border-pink-100 bg-white hover:border-pink-300",
              ].join(" ")}
            >
              <div
                className="h-16 w-full overflow-hidden rounded-xl"
                style={{
                  border: `3px solid ${frame.border}`,
                }}
              >
                {frame.previewType === "image" ? (
                  <img
                    src={frame.preview}
                    alt={frame.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: frame.preview }}
                  />
                )}
              </div>
              <p className="mt-2 text-xs font-semibold text-pink-600">
                {frame.name}
              </p>
              <p className="text-[11px] text-pink-400">{frame.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          disabled={!framedPhoto}
          className={[
            "rounded-xl px-4 py-2 text-sm font-semibold",
            framedPhoto
              ? "bg-pink-500 text-white"
              : "bg-pink-100 text-pink-300",
          ].join(" ")}
        >
          Download
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!framedPhoto}
          className={[
            "rounded-xl border px-4 py-2 text-sm font-semibold",
            framedPhoto
              ? "border-pink-200 text-pink-600"
              : "border-pink-100 text-pink-300",
          ].join(" ")}
        >
          Save
        </button>
        {saveStatus && <span className="text-xs text-pink-500">{saveStatus}</span>}
      </div>
    </div>
  );
}
