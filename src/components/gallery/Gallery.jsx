import React from "react";
import { galleryCards } from "./GalleryData";
import GalleryCard from "./GalleryCard";
import Stack from "./Stack";

export default function Gallery() {
  return (
    <section className="w-full bg-bgPrimary py-14 sm:py-20">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-8 px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-l text-textDark">Some Memories</h2>
          <p className="mt-2 text-caption text-textMuted">
            a small stack of moments, opened slowly.
          </p>
          <p className="mt-2 text-caption text-textSecondary">
            each one stays with us, quietly.
          </p>
        </div>
        <div className="mx-auto w-full max-w-130">
          <div className="aspect-square w-full">
            <Stack
              randomRotation
              sendToBackOnClick
              sensitivity={160}
              animationConfig={{ stiffness: 260, damping: 24 }}
              mobileClickOnly
              cards={galleryCards.map((card) => (
                <GalleryCard
                  key={card.id}
                  title={card.title}
                  date={card.date}
                  tone={card.tone}
                />
              ))}
            />
          </div>
          <p className="mt-4 text-center text-caption text-textMuted/70">
            tap a card, some stories open quietly.
          </p>
        </div>
      </div>
    </section>
  );
}
