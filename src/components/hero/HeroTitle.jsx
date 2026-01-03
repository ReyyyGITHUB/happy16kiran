import React from "react";
import HeroTitleCta from "./HeroTitleCta";
import HeroTitleDecorations from "./HeroTitleDecorations";
import HeroTitleText from "./HeroTitleText";

export default function HeroTitle() {
  return (
    <section className="w-full">
      <div className="relative w-full py-10 sm:py-12 md:py-20">
        <HeroTitleDecorations />
        <HeroTitleText />
        <HeroTitleCta />
      </div>
    </section>
  );
}
