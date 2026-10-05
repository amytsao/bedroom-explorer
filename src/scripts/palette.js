// 👌31 by catastrofie — https://lospec.com/palette-list/31
export const PALETTE = Object.freeze([
  "#636663", "#87857c", "#bcad9f", "#f2b888", "#eb9661", "#b55945",
  "#734c44", "#3d3333", "#593e47", "#7a5859", "#a57855", "#de9f47",
  "#fdd179", "#fee1b8", "#d4c692", "#a6b04f", "#819447", "#44702d",
  "#2f4d2f", "#546756", "#89a477", "#a4c5af", "#cae6d9", "#f1f6f0",
  "#d5d6db", "#bbc3d0", "#96a9c1", "#6c81a1", "#405273", "#303843", "#14233a",
]);
const rgb = PALETTE.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
const cache = new Map();
export function nearestPaletteIndex(r, g, b) {
  const key = (r << 16) | (g << 8) | b;
  if (cache.has(key)) return cache.get(key);
  let best = 0, distance = Infinity;
  for (let i = 0; i < rgb.length; i++) {
    const candidate = (r - rgb[i][0]) ** 2 + (g - rgb[i][1]) ** 2 + (b - rgb[i][2]) ** 2;
    if (candidate < distance) { best = i; distance = candidate; }
  }
  cache.set(key, best);
  return best;
}
export function paletteColor(color) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  return PALETTE[nearestPaletteIndex(...[1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)))];
}
// Recolor a rendered texture while preserving the supplied source file and alpha.
export function applyPalette(context, width, height, colorMap = {}) {
  const overrides = new Map(Object.entries(colorMap).map(([from, to]) => [
    parseInt(from.slice(1), 16), rgb[PALETTE.indexOf(to)],
  ]));
  const pixels = context.getImageData(0, 0, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (!pixels.data[i + 3]) continue;
    const value = (pixels.data[i] << 16) | (pixels.data[i + 1] << 8) | pixels.data[i + 2];
    const color = overrides.get(value) ?? rgb[nearestPaletteIndex(...pixels.data.subarray(i, i + 3))];
    pixels.data.set(color, i);
  }
  context.putImageData(pixels, 0, 0);
}
export function paletteTexture(scene, sourceKey, colorMap) {
  const key = `${sourceKey}-palette`;
  if (scene.textures.exists(key)) return key;
  const source = scene.textures.get(sourceKey);
  const image = source.getSourceImage();
  const texture = scene.textures.createCanvas(key, image.width, image.height);
  const context = texture.getContext();
  context.drawImage(image, 0, 0);
  applyPalette(context, image.width, image.height, colorMap);
  for (const name of source.getFrameNames()) {
    const frame = source.get(name);
    texture.add(/^\d+$/.test(name) ? Number(name) : name, 0, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight);
  }
  texture.refresh();
  return key;
}
