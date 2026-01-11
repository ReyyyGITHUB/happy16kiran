import React from "react";
import CircularGallery from "../CircularGallery";

export default function Gallery() {
  return (
    <section className="w-full py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-textDark sm:text-3xl">
          Our memories
        </h2>
        <div
          className="h-[60vh] min-h-[360px] max-h-[600px] w-full overflow-hidden"
          style={{ position: "relative" }}
        >
          <CircularGallery borderRadius={0.09} scrollSpeed={3.1} scrollEase={0.07} />
        </div>
      </div>
    </section>
  );
}
