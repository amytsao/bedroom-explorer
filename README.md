# Bedroom Explorer

## Run locally

Use Node.js 22.12.0 or newer.

```sh
npm install
npm run dev
```

Open the URL printed by Astro, usually http://localhost:4321.

```sh
npm run build
npm run preview
```

Production output is generated in `dist/` for static hosting. Phaser is bundled locally through npm; there is no runtime dependency on a game-engine CDN.

## Source modules

| File | Purpose |
| --- | --- |
| `src/pages/index.astro` | Homepage route |
| `src/layouts/BaseLayout.astro` | Metadata, fonts, global stylesheet |
| `src/components/BedroomExplorer.astro` | Accessible game canvas, dialog, controls, progress |
| `src/styles/global.css` | Responsive styling and light/dark themes |
| `src/scripts/game.js` | Phaser configuration, mounting, hot-reload and Astro navigation cleanup |
| `src/scripts/BedroomScene.js` | Scene lifecycle, sprites, camera, discovery logic, animations |
| `src/scripts/scene.js` | Immutable room configuration, sprite registry, object descriptions |
| `src/scripts/art.js` | Scaled pixel drawings baked into reusable Phaser textures |
| `src/scripts/asset-art.js` | Source sprite crops, compositions, background transparency, and palette mapping |
| `src/scripts/palette.js` | Shared 31-color palette and runtime texture recoloring |
| `src/scripts/input.js` | Phaser keyboard events and accessible DOM touch controls, with cleanup |
| `src/scripts/ui.js` | Dialog, prompts, progress updates |
| `public/assets/` | Optional custom images |

`GAME_CONFIG` controls the world, viewport, floor boundary, player start position, and walking lane. Increase `floorTop` to make the floor shallower. The player's feet are at `playerY + playerFootOffset` (306 by default); adjust the walking lane when changing room height.

## Customize the room

Edit `GAME_CONFIG`, `CANVAS_ITEMS`, and `HOTSPOT_DEFINITIONS` in `src/scripts/scene.js`.

To add an object:
* add image to `public/assets/` and set the item's `src` to its filename, e.g. `bed.webp`
* `crop` - source rectangle
* `parts`- if you need more than one source image
* `frameWidth`, `frameHeight`, and `frameCount` - for sprite sheets (e.g. dog wagging tail)

Object inspection positions are derived from their visual item's bounds.

For another room, add a Phaser Scene and register it in `game.js`.

## Walking sprite sheet

* Walking spritesheet is `public/assets/hornet-walking.webp`
* Consists of 5 36 × 36 frames

The player entry in `src/scripts/scene.js` controls the sheet:

```js
player: {
  src: 'hornet-walking.webp',
  frameWidth: 36, frameHeight: 36, frameCount: 5,
  frameRate: 10, idleFrame: 0, facing: 'left',
  x: 0, y: 0, w: 72, h: 72, layer: 100
}
```

`BedroomScene.preload()` uses `load.spritesheet()` for this entry. `createAnimations()` loops frames 0–4 under `player-walk`; `updatePlayerSprite()` plays it while moving, stops on frame 0 while idle, and flips the sprite when walking left. Reduced motion keeps frame 0 while allowing movement.

`w: 72, h: 72` gives uniform 2× scaling; use 36 × 36 for native size or 108 × 108 for 3×. The bottom-center origin keeps Hornet's feet on the same floor position when resizing. If the source artwork faces left, change `facing` to `'right'` (I messed up on how the art was facing and did not want to change it : ) ).

Still pose is frame 0, an improvement could be adding an idle animation
