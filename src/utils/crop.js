export const getCoverCrop = (srcW, srcH, dstW, dstH) => {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  let sx = 0;
  let sy = 0;
  let sw = srcW;
  let sh = srcH;

  if (srcAspect > dstAspect) {
    sw = srcH * dstAspect;
    sx = (srcW - sw) / 2;
  } else {
    sh = srcW / dstAspect;
    sy = (srcH - sh) / 2;
  }

  return {
    sx: Math.round(sx),
    sy: Math.round(sy),
    sw: Math.round(sw),
    sh: Math.round(sh),
  };
};

export const drawCover = (ctx, src, dstX, dstY, dstW, dstH) => {
  const srcW = src.videoWidth || src.naturalWidth || src.width;
  const srcH = src.videoHeight || src.naturalHeight || src.height;
  if (!srcW || !srcH) return;
  const { sx, sy, sw, sh } = getCoverCrop(srcW, srcH, dstW, dstH);
  ctx.drawImage(src, sx, sy, sw, sh, dstX, dstY, dstW, dstH);
};

