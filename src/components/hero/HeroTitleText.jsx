import React from "react";

export default function HeroTitleText() {
  return (
    <div className="relative z-10 flex flex-col gap-1 justify-center items-center text-center px-4">
      {/* Top */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <h1 className="text-[clamp(32px,7vw,60px)] font-heading font-extrabold tracking-tight">
          Enjoy ur
        </h1>

        {/* Pink chip (sedikit rotate) */}
        <span className="inline-flex items-center bg-pink text-white px-3 py-1 md:px-4 md:py-2 -rotate-2 shadow-sm">
          <span className="text-[clamp(32px,7vw,60px)] font-heading font-extrabold tracking-tight">
            16 Yo, Kiran !!
          </span>
        </span>
      </div>

      {/* Bottom */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <h2 className="text-[clamp(28px,6vw,48px)] font-heading font-extrabold tracking-tight">
          A year to
        </h2>
        <h2 className="text-[clamp(28px,6vw,48px)] font-heading font-extrabold tracking-tight text-pink">
          grow,
        </h2>
        <h2 className="text-[clamp(28px,6vw,48px)] font-heading font-extrabold tracking-tight text-blue">
          learn,
        </h2>
        <h2 className="text-[clamp(28px,6vw,48px)] font-heading font-extrabold tracking-tight text-pink">
          and become.
        </h2>
      </div>
    </div>
  );
}
