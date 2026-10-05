export const assetKey = id => `asset-${id}`;
export const partKey = (id, index) => index === 0 ? assetKey(id) : `${assetKey(id)}-part-${index}`;

// Composite or crop source art in the renderer
// downloaded PNGs stay unchanged
export function prepareRoomTexture(scene, id, item) {
  if (!scene.textures.exists(assetKey(id))) return null;

  const parts = item.parts ?? [{ src: item.src, crop: item.crop, transparentColor: item.transparentColor }];
  if (parts.some((_, i) => !scene.textures.exists(partKey(id, i)))) return null;
  const key = `${assetKey(id)}-render`;
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.get(assetKey(id)).getSourceImage();
  const width = item.artWidth ?? item.crop?.w ?? source.width;
  const height = item.artHeight ?? item.crop?.h ?? source.height;
  const texture = scene.textures.createCanvas(key, width, height);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  parts.forEach((part, index) => {
    const image = scene.textures.get(partKey(id, index)).getSourceImage();
    const crop = part.crop ?? { x: 0, y: 0, w: image.width, h: image.height };
    const canvas = document.createElement("canvas");
    canvas.width = crop.w; canvas.height = crop.h;
    const partContext = canvas.getContext("2d", { willReadFrequently: true });
    partContext.drawImage(image, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    const x = part.x ?? 0, y = part.y ?? 0, w = part.w ?? crop.w, h = part.h ?? crop.h;
    if (part.background) { context.fillStyle = part.background; context.fillRect(x, y, w, h); }
    context.drawImage(canvas, x, y, w, h);
  });
  texture.refresh();
  return key;
}
