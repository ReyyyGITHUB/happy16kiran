import React from "react";

export default function GalleryCard({ title, date, tone }) {
  return (
    <div className={`group relative flex h-full flex-col overflow-hidden rounded-[36px] border border-subtle ${tone} shadow-sm transition-transform duration-300 hover:-translate-y-1`}>
      <div className="pointer-events-none absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className={`relative h-[240px] w-full ${tone}`}>
        <div className="absolute left-6 top-6 rounded-full bg-pinkSoft px-3 py-1 text-caption text-textSecondary">
          memory
        </div>
        <div className="absolute right-5 top-5 text-base text-textSecondary/80">
          ✨
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[80px] items-center justify-between px-6 py-4">
        <p className="text-base text-textPrimary">{title}</p>
        <span className="text-caption text-textMuted">{date}</span>
      </div>
    </div>
  );
}
