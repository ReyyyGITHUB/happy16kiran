import React from "react";
import { Sparkles } from "lucide-react";

export default function NavbarCta({ onScrollTo }) {
  return (
    <a
      href="#whatif"
      onClick={onScrollTo("whatif")}
      className={[
        "inline-flex items-center gap-2 rounded-lg px-4 py-2",
        "text-base font-semibold",
        "bg-[#111] text-white",
        "hover:opacity-90 active:scale-[0.99] transition",
        "shadow-sm",
      ].join(" ")}
    >
      Let's play
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
        <Sparkles className="h-4 w-4" />
      </span>
    </a>
  );
}
