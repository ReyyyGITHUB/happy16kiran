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
    <div className="relative z-10 mt-8 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => scrollToId("photobooth")}
        className="inline-flex items-center gap-2 rounded-md bg-[#111] px-4 py-2 text-base text-white shadow-sm hidden sm:inline-flex"
      >
        Try Photobooth! <Sparkles className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollToId("gallery")}
        className="inline-flex items-center gap-2 rounded-md border border-subtle bg-white px-4 py-2 text-base shadow-sm hidden sm:inline-flex"
      >
        See our memories
      </button>

      <button
        type="button"
        onClick={() => scrollToId("photobooth")}
        className="inline-flex items-center gap-2 rounded-md bg-[#111] px-3 py-2 text-sm text-white shadow-sm sm:hidden"
      >
        Try Photobooth! <Sparkles className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollToId("gallery")}
        className="inline-flex items-center gap-2 rounded-md border border-subtle bg-white px-3 py-2 text-sm shadow-sm sm:hidden"
      >
        See our memories
      </button>
    </div>
  );
}
