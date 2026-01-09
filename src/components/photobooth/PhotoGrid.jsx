import React from "react";

export default function PhotoGrid({ photos, onSelect }) {
  if (!photos.length) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {photos.map((src, i) => (
        <button
          key={`shot-${i}`}
          type="button"
          onClick={() => onSelect?.(i)}
          className="overflow-hidden rounded-2xl border border-pink-100 shadow-sm"
          aria-label={`Lihat foto ${i + 1}`}
        >
          <img
            src={src}
            alt={`shot-${i + 1}`}
            className="aspect-[3/4] w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
