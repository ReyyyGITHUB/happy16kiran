import React from "react";
import { Sparkles } from "lucide-react";

export default function HeroTitleCta() {
  return (
    <div className="relative z-10 mt-8 flex items-center justify-center gap-3">
      <button className="inline-flex items-center gap-2 rounded-md bg-[#111] px-4 py-2 text-white text-base shadow-sm">
        Start Here <Sparkles className="h-4 w-4" />
      </button>

      <button className="inline-flex items-center gap-2 rounded-md border border-subtle px-4 py-2 text-base bg-white shadow-sm">
        See Our Memories <span className="text-textMuted"></span>
      </button>
    </div>
  );
}
