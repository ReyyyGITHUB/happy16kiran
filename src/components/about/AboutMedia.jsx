import React from "react";
import { Sparkles } from "lucide-react";

export default function AboutMedia() {
  return (
    <div className="flex w-full justify-center px-4 sm:px-6 mt-2">
      <div className="relative w-full max-w-[720px]">
        <div className="absolute inset-0 -translate-x-4 -translate-y-2 rotate-[1deg] origin-bottom-left rounded-3xl bg-bgSurface/45 ring-1 ring-border-subtle/40" />
        <div className="absolute inset-0 translate-x-1 translate-y-2 rotate-[-0.5deg] origin-bottom-left rounded-3xl bg-bgSurface/20 ring-1 ring-border-subtle/30" />
        <div className="relative overflow-hidden rounded-3xl bg-bgSurface ring-1 ring-border-subtle shadow-sm origin-bottom-left transform-gpu will-change-transform sm:-rotate-[1.5deg] md:-rotate-2">
          <video
            className="w-full h-auto"
            controls
          >
            <source src="/assets/video/vid-about.mp4" type="video/mp4" />
          </video>
          <span className="pointer-events-none absolute -top-4 left-4 -rotate-3 text-xs text-textMuted opacity-70">
            we didn’t plan this
          </span>
          <span className="pointer-events-none absolute bottom-3 right-3 -rotate-6 text-textMuted/70">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
