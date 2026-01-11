import { drawCover } from "../utils/crop";

export const renderStrip = async ({
  slots,
  photos,
  overlaySrc,
  width,
  height,
}) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const [overlay, ...images] = await Promise.all([
    overlaySrc ? loadImage(overlaySrc) : Promise.resolve(null),
    ...photos.map((src) => loadImage(src)),
  ]);

  slots.forEach((slot, index) => {
    const img = images[index];
    if (!img) return;
    drawCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
  });

  if (overlay) {
    ctx.drawImage(overlay, 0, 0, width, height);
  }

  return canvas.toDataURL("image/png");
};
