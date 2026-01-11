import React from "react";
import AboutCaption from "./AboutCaption";
import AboutHeader from "./AboutHeader";
import AboutMedia from "./AboutMedia";

export default function About() {
  return (
    <section className="w-full bg-bgPrimary py-12 sm:py-16">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-5 sm:px-12">
        {/* Header */}
        <AboutHeader />
        {/* Media stack */}
        <AboutMedia />
        {/* Caption */}
        <AboutCaption />
      </div>
    </section>
  );
}
