import React, { useMemo, useState } from "react";
import ForYour16Footer from "./ForYour16Footer";
import ForYour16Header from "./ForYour16Header";
import { wishes } from "./ForYour16Data";
import ForYour16Wish from "./ForYour16Wish";

export default function ForYour16() {
  const wishesMemo = useMemo(() => wishes, []);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [glowPulse, setGlowPulse] = useState(false);

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setGlowPulse(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % wishesMemo.length);
      setAnimating(false);
      setGlowPulse(false);
    }, 260);
  };

  const current = wishesMemo[index];
  const progressDots = useMemo(
    () =>
      wishesMemo.map((_, i) => (
        <span
          key={`dot-${i}`}
          className={`h-1.5 w-1.5 rounded-full ${
            i === index ? "bg-[#F3F4F6]" : "bg-white/30"
          }`}
        />
      )),
    [index, wishesMemo]
  );

  return (
    <section
      className="relative w-full bg-[#07070A] min-h-screen flex items-stretch py-16 sm:py-24 cursor-pointer"
      onClick={handleNext}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[130px] transition-all duration-300 ${current.mood} ${
            glowPulse ? "scale-105" : "scale-100"
          }`}
        />
        <div className="absolute -left-8 top-6 h-8 w-8 rounded-full border border-white/10" />
        <div className="absolute right-10 bottom-8 h-10 w-10 rounded-full border border-white/10" />
      </div>

      <div className="relative mx-auto flex w-full max-w-225 flex-col justify-between gap-10 px-6 text-center min-h-[80vh] sm:min-h-[85vh]">
        {/* Header */}
        <ForYour16Header />
        {/* Wish */}
        <ForYour16Wish text={current.text} animating={animating} />
        {/* Footer */}
        <ForYour16Footer dots={progressDots} />
      </div>
    </section>
  );
}
