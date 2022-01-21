export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

export function checkLabel(labelA, labelB, type1, type2) {
  return (labelA === type1 && labelB === type2) ||
    (labelA === type2 && labelB === type1);
}

export function createSpriteAnimation(options) {
  const { ctx, image, target, source, body, render, frames, initFrame, offset, rate, reverse, reverse_image, follow } = {
    rate: 1,
    follow: false,
    ...options,
  };
  const { size: targetSize } = target;
  const { size: sourceSize, sy } = source;
  const { x: offsetX, y: offsetY } = offset;

  const imageWidth = image.width;
  const frameMin = frames[0];
  const frameMax = frames[1];
  let frameId = initFrame || frameMin;
  let frameCount = 0;

  return {
    loop: animation,
    reset() {
      frameCount = 0;
      frameId = initFrame || frameMin;
    },
    play() {
      frameCount++;
      if (frameCount % (1 / rate) === 0) {
        if (frames.length === 1) return;
        frameId++;
        if (frameId > frameMax) {
          frameId = frameMin;
        }
      }
    }
  };

  function animation() {
    const { position: pos } = body;
    const { min } = render.bounds;
    const pos_x = frameId * sourceSize[0];
    const dx = pos.x+offsetX + (follow ? 0 : -min.x);
    const dy = pos.y+offsetY + (follow ? 0 : -min.y);

    if (reverse && reverse()) {
      ctx.drawImage(
        reverse_image,
        imageWidth-pos_x-sourceSize[0],sy || 0,sourceSize[0],sourceSize[1], // source
        dx,dy,targetSize[0],targetSize[1],
      );
    } else {
      ctx.drawImage(
        image,
        pos_x,sy || 0,sourceSize[0],sourceSize[1], // source
        dx,dy,targetSize[0],targetSize[1],
      );
    }
  }
}
