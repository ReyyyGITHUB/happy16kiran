import React from "react";
import { Sparkles } from "lucide-react";

export default function HeroTitleCta() {
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => scrollToId("photobooth")}
        className="inline-flex w-full max-w-[240px] items-center justify-center gap-2 rounded-md bg-[#111] px-3 py-2 text-sm text-white shadow-sm sm:px-4 sm:py-2 sm:text-base"
      >
        Try Photobooth! <Sparkles className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollToId("gallery")}
        className="inline-flex w-full max-w-[240px] items-center justify-center gap-2 rounded-md border border-subtle bg-white px-3 py-2 text-sm shadow-sm sm:px-4 sm:py-2 sm:text-base"
      >
        See our memories
      </button>
    </div>
  );
}
