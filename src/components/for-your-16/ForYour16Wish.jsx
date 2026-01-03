import React, { useMemo } from "react";

export default function ForYour16Wish({ text, animating }) {
  const keyword = useMemo(() => text.split(" ")[0], [text]);

  return (
    <div className="flex flex-col items-center gap-3 select-none transition-transform active:scale-[0.98]">
      <h1
        className={`text-[clamp(36px,6vw,64px)] font-heading font-extrabold leading-tight text-[#F3F4F6] whatif-glow transition-all duration-500 ${
          animating
            ? "opacity-0 scale-90 blur-sm tracking-[0.12em]"
            : "opacity-100 scale-100 blur-0 tracking-[0.02em]"
        }`}
      >
        <span className="relative">
          {keyword}
          <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-white/10" />
        </span>{" "}
        {text.replace(keyword, "").trim()}
      </h1>
      <p className="text-caption text-white/55 mt-1">no pressure. just a wish.</p>
    </div>
  );
}
