import { CANVAS_ITEMS, GAME_CONFIG } from "./scene.js";
import { PALETTE, applyPalette, paletteColor } from "./palette.js";

// Bake the original procedural drawings into Phaser-managed canvas textures.
// Padding retains strokes and details that extend beyond an item's authored bounds.
export const ART_PADDING = 24;
// Design-space dimensions let authored furniture scale with CANVAS_ITEMS.
const ART_SIZES = {
  window: [188, 157], pictures: [246, 80], table: [272, 130],
  computer: [96, 98], dice: [38, 18],
  controllers: [122, 29],
  dog: [105, 62], bed: [298, 173],
  lamp: [120, 178], bookshelf: [162, 342],
};

export function buildArtTextures(scene, darkMode) {
  const W = GAME_CONFIG.worldWidth;
  const H = GAME_CONFIG.worldHeight;
  const FLOOR_TOP = GAME_CONFIG.floorTop;
  let ctx;
  let reducedMotion = false;

  function paint(key, width, height, offsetX, offsetY, draw) {
    const texture = scene.textures.exists(key)
      ? scene.textures.get(key)
      : scene.textures.createCanvas(key, width, height);
    ctx = texture.getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    draw();
    ctx.restore();
    applyPalette(ctx, width, height);
    texture.refresh();
    return key;
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = paletteColor(color);
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function line(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = paletteColor(color);
    ctx.lineWidth = width || 2;
    ctx.beginPath(); ctx.moveTo(Math.round(x1), Math.round(y1)); ctx.lineTo(Math.round(x2), Math.round(y2)); ctx.stroke();
  }
  function box(x, y, w, h, fill, edge, edgeW) {
    px(x, y, w, h, fill);
    ctx.strokeStyle = paletteColor(edge);
    ctx.lineWidth = edgeW || 4;
    ctx.strokeRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function drawRoomBackground() {
    const wall = darkMode ? '#303843' : '#cae6d9';
    const wallShade = darkMode ? '#14233a' : '#a4c5af';
    const floor = darkMode ? '#734c44' : '#bcad9f';
    const floorShade = darkMode ? '#593e47' : '#a57855';

    // Flat wall with a shaded band near the floor.
    px(0, 0, W, FLOOR_TOP, wall);
    px(0, FLOOR_TOP - 40, W, 40, wallShade);

    // Narrow baseboard separates wall and floor.
    px(0, FLOOR_TOP - 8, W, 8, '#546756');
    px(0, FLOOR_TOP - 8, W, 2, '#de9f47');

    // Flat floor, darker toward the bottom.
    px(0, FLOOR_TOP, W, H - FLOOR_TOP, floor);
    px(0, H - 18, W, 18, floorShade);
  }

  function drawBookshelfFallback(item) {
    var x = item.x + 5, y = item.y;
    box(x, y, 152, 334, '#713c3c', '#0e292e', 7);
    for (var sy = 48; sy < 320; sy += 68) px(x + 8, y + sy, 136, 10, '#a55742');
    var colors = ['#dd6c50', '#e7ae56', '#4f9c94', '#c95068', '#e1d078', '#6c78a1'], idx = 0;
    for (var row = 0; row < 4; row++) {
      var bx = x + 14;
      for (var j = 0; j < 6; j++) {
        var bw = 13 + (j % 3) * 3, bh = 31 + (j % 2) * 11;
        px(bx, y + 46 + row * 68 - bh, bw, bh, colors[idx++ % colors.length]); px(bx + 3, y + 49 + row * 68 - bh, 2, bh - 6, 'rgba(255,255,255,.28)');
        bx += bw + 5;
      }
    }
    px(x - 5, y + 328, 162, 14, '#4e3237');
  }
  function drawPicturesFallback(item) {
    const { x, y } = item;

    const colors = {
      wood: PALETTE[10],
      darkWood: PALETTE[6],
      border: PALETTE[7],
      sky: PALETTE[26],
      distantMountain: PALETTE[27],
      mountain: PALETTE[28],
      snow: PALETTE[23],
      grass: PALETTE[17],
      sun: PALETTE[12],
      paper: PALETTE[13],
      red: PALETTE[5],
      gold: PALETTE[11],
      ink: PALETTE[8],
    };

    function mountain(centerX, topY, height, color) {
      for (let row = 0; row < height; row += 2) {
        const halfWidth = Math.floor(row * 0.8);
        px(centerX - halfWidth, topY + row, halfWidth * 2 + 2, 2, color);
      }
    }

    // Left: mountain landscape.
    box(x, y, 92, 80, colors.wood, colors.border, 6);
    px(x + 11, y + 11, 70, 58, colors.sky);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 11, y + 11, 70, 58);
    ctx.clip();

    px(x + 61, y + 17, 10, 10, colors.sun);
    mountain(x + 28, y + 25, 44, colors.distantMountain);
    mountain(x + 53, y + 20, 49, colors.mountain);
    mountain(x + 53, y + 20, 10, colors.snow);
    px(x + 11, y + 63, 70, 6, colors.grass);

    ctx.restore();

    // Right: signed print, 16 design pixels from the left frame.
    const frameX = x + 92 + 16;
    const frameY = y + 12;

    box(frameX, frameY, 66, 60, colors.darkWood, colors.border, 6);
    px(frameX + 11, frameY + 11, 44, 38, colors.paper);

    px(frameX + 18, frameY + 17, 13, 19, colors.red);
    px(frameX + 29, frameY + 23, 18, 12, colors.distantMountain);
    px(frameX + 23, frameY + 31, 17, 5, colors.gold);

    // Signature.
    line(frameX + 42, frameY + 45, frameX + 45, frameY + 39, colors.ink, 1);
    line(frameX + 45, frameY + 39, frameX + 48, frameY + 45, colors.ink, 1);
    line(frameX + 43, frameY + 43, frameX + 47, frameY + 43, colors.ink, 1);
    line(frameX + 41, frameY + 47, frameX + 51, frameY + 47, colors.ink, 1);
  }

  const ITEM_DRAWERS = {
    pictures: drawPicturesFallback,
    bookshelf: drawBookshelfFallback,
  };

  paint("room-background", W, H, 0, 0, drawRoomBackground);


  const specs = {};
  for (const [id, draw] of Object.entries(ITEM_DRAWERS)) {
    const item = CANVAS_ITEMS[id];
    const make = (suffix, time = 0, calm = false) => {
      reducedMotion = calm;
      return paint(`art-${id}${suffix}`, item.w + ART_PADDING * 2, item.h + ART_PADDING * 2,
        ART_PADDING, ART_PADDING, () => {
          const [width, height] = ART_SIZES[id];
          ctx.scale(item.w / width, item.h / height);
          draw({ ...item, x: 0, y: 0, w: width, h: height }, time);
        });
    };
    specs[id] = { key: make("", 0, true), x: item.x - ART_PADDING, y: item.y - ART_PADDING };
  }

  return specs;
}

// todo: visual response?
export function hotspotTexture(scene, radius) {
  const key = `hotspot-${radius}`;
  const width = Math.round(radius * 1.12);
  const height = Math.round(radius * .9);
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width + 4, height + 4);
    texture.refresh();
  }
  return { key, width, height };
}
