import Phaser from "phaser";
import { GAME_CONFIG } from "./scene.js";
import { BedroomScene } from "./BedroomScene.js";

export function createBedroomGame(canvas) {
  delete canvas.dataset.ready;
  return new Phaser.Game({
    type: Phaser.CANVAS,
    canvas,
    width: GAME_CONFIG.viewportWidth,
    height: GAME_CONFIG.viewportHeight,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#14233a",
    input: { keyboard: { capture: [] } },
    scale: { mode: Phaser.Scale.NONE },
    scene: [BedroomScene],
    callbacks: {
      postBoot(game) {
        game.canvas.style.width = "100%";
        game.canvas.style.height = "auto";
      },
    },
  });
}

let game;
function mount() {
  const canvas = document.getElementById("game");
  if (!canvas || game?.canvas === canvas) return;
  destroy();
  game = createBedroomGame(canvas);
}
function destroy() {
  if (game) {
    delete game.canvas?.dataset.ready;
    game.destroy(false);
    game = undefined;
  }
}

mount();
document.addEventListener("astro:page-load", mount);
document.addEventListener("astro:before-swap", destroy);
if (import.meta.hot) import.meta.hot.dispose(() => {
  document.removeEventListener("astro:page-load", mount);
  document.removeEventListener("astro:before-swap", destroy);
  destroy();
});
