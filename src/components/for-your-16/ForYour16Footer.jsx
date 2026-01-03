import React from "react";

export default function ForYour16Footer({ dots }) {
  return (
    <div className="flex items-center justify-between text-[11px] text-white/45">
      <div className="flex items-center gap-2">{dots}</div>
      <button
        type="button"
        className="text-white/45 underline underline-offset-4 hover:text-white/70"
      >
        that's enough
      </button>
    </div>
  );
}
