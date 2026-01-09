import React from "react";
import CircularGallery from "../CircularGallery";

export default function Gallery() {
  return (
    <div style={{ height: "600px", position: "relative" }}>
      <CircularGallery borderRadius={0.09} scrollSpeed={3.1} scrollEase={0.07} />
    </div>
  );
}
