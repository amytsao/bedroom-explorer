import Phaser from "phaser";
import { GAME_CONFIG, CANVAS_ITEMS, DRAWN_ITEMS, HOTSPOT_DEFINITIONS } from "./scene.js";
import { ART_PADDING, buildArtTextures, hotspotTexture } from "./art.js";
import { paletteTexture } from "./palette.js";
import { assetKey, partKey, prepareRoomTexture } from "./asset-art.js";
import { bindGameInput } from "./input.js";
import { createGameUI } from "./ui.js";


export class BedroomScene extends Phaser.Scene {
  constructor() { super("Bedroom"); }

  preload() {
    // Phaser loads optional images; absent or failed images use the generated art.
    for (const [id, item] of Object.entries(CANVAS_ITEMS)) {
      if (DRAWN_ITEMS.has(id) || !item.src) continue;
      const url = `${import.meta.env.BASE_URL}assets/${item.src}`;
      if (item.frameWidth && item.frameHeight) {
        this.load.spritesheet(assetKey(id), url, {
          frameWidth: item.frameWidth,
          frameHeight: item.frameHeight,
          endFrame: item.frameCount - 1,
        });
      } else this.load.image(assetKey(id), url);
      item.parts?.forEach((part, index) => {
        if (index > 0) this.load.image(partKey(id, index), `${import.meta.env.BASE_URL}assets/${part.src}`);
      });
    }
  }

  create() {
    this.playerState = { x: GAME_CONFIG.playerStartX, y: GAME_CONFIG.playerY, dir: 1, moving: false };
    this.found = new Set();
    this.nearby = null;
    this.hotspots = HOTSPOT_DEFINITIONS.map(definition => {
      const item = CANVAS_ITEMS[definition.visualId];
      return { ...definition, x: item.x + item.w * definition.anchorX, y: item.y + item.h * definition.anchorY };
    });
    this.colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    this.motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotion = this.motionPreference.matches;
    const art = buildArtTextures(this, this.colorScheme.matches);
    this.add.image(0, 0, "room-background").setOrigin(0).setDepth(0);
    this.roomSprites = {};
    this.roomAssetTextures = {};
    for (const [id, item] of Object.entries(CANVAS_ITEMS)) {
      if (id === "player") continue;

      const drawn = DRAWN_ITEMS.has(id);
      const spec = drawn ? art[id] : null;
      const texture = drawn
        ? spec.key
        : prepareRoomTexture(this, id, item);

      if (!texture) {
        throw new Error(`Missing image for "${id}": ${item.src}`);
      }

      this.roomAssetTextures[id] = drawn ? null : texture;

      const sprite = this.add.sprite(
        drawn ? spec.x : item.x,
        drawn ? spec.y : item.y,
        texture,
        !drawn && item.frameWidth
          ? item.idleFrame ?? 0
          : undefined
      )
        .setOrigin(0)
        .setDepth(item.layer);

      // Drawn textures already contain padding and their final size.
      if (!drawn) {
        sprite.setDisplaySize(item.w, item.h);
      }

      this.roomSprites[id] = sprite;
    }
    if (!this.textures.exists(assetKey("player"))) {
      throw new Error("Missing player spritesheet");
    }
    this.customPlayer = this.textures.exists(assetKey("player"));
    this.playerTexture = this.customPlayer ? paletteTexture(this, assetKey("player")) : "player-right-0";
    this.playerSheet = this.customPlayer && Boolean(CANVAS_ITEMS.player.frameWidth && CANVAS_ITEMS.player.frameHeight);
    this.playerSprite = this.add.sprite(0, 0, this.playerTexture,
      this.playerSheet ? CANVAS_ITEMS.player.idleFrame ?? 0 : undefined)
      .setOrigin(0).setDepth(CANVAS_ITEMS.player.layer);
    if (this.customPlayer) this.playerSprite.setOrigin(.5, 1)
      .setDisplaySize(CANVAS_ITEMS.player.w, CANVAS_ITEMS.player.h);
    this.highlight = this.add.image(0, 0, "__WHITE").setVisible(false).setDepth(90).setAlpha(.88);
    this.createAnimations();
    this.applyMotionPreference();
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.worldWidth, GAME_CONFIG.worldHeight);
    this.cameras.main.startFollow(this.playerState, true, .12, 1,
      GAME_CONFIG.viewportWidth * (GAME_CONFIG.cameraAnchor - .5),
      GAME_CONFIG.playerY - GAME_CONFIG.viewportHeight / 2);
    this.ui = createGameUI();
    this.ui.syncProgress(this.found, this.hotspots.length);
    this.controls = bindGameInput(this, this.ui);
    this.updateNearby();
    this.updatePlayerSprite();

    const themeChanged = () => buildArtTextures(this, this.colorScheme.matches);
    const motionChanged = event => {
      this.reducedMotion = event.matches;
      this.applyMotionPreference();
      this.updateHighlight();
      this.updatePlayerSprite();
    };
    this.colorScheme.addEventListener("change", themeChanged);
    this.motionPreference.addEventListener("change", motionChanged);
    const cleanup = () => {
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      this.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
      this.controls.dispose();
      this.colorScheme.removeEventListener("change", themeChanged);
      this.motionPreference.removeEventListener("change", motionChanged);
      this.highlightTween?.remove();
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
    this.game.canvas.dataset.ready = "true";
  }

  createAnimations() {
    if (this.playerSheet && !this.anims.exists("player-walk")) {
      const item = CANVAS_ITEMS.player;
      this.anims.create({
        key: "player-walk",
        frames: this.anims.generateFrameNumbers(this.playerTexture, { start: 0, end: item.frameCount - 1 }),
        frameRate: item.frameRate,
        repeat: -1,
      });
    }
    for (const [id, item] of Object.entries(CANVAS_ITEMS)) {
      if (id === "player" || !item.frameWidth || !this.roomAssetTextures[id]) continue;
      const key = `${id}-asset-loop`;
      if (!this.anims.exists(key)) this.anims.create({
        key, frames: this.anims.generateFrameNumbers(this.roomAssetTextures[id], {
          start: item.animationStart ?? 0, end: item.animationEnd ?? item.frameCount - 1,
        }), frameRate: item.frameRate ?? 8, repeat: -1,
      });
    }
  }

  applyMotionPreference() {
    for (const [id, item] of Object.entries(CANVAS_ITEMS)) {
      if (id === "player") continue;

      const sprite = this.roomSprites[id];
      if (!sprite || !this.roomAssetTextures[id] || !item.frameWidth) {
        continue;
      }

      if (this.reducedMotion) {
        sprite.stop().setFrame(item.idleFrame ?? 0);
      } else {
        sprite.play(`${id}-asset-loop`, true);
      }
    }
  }

  update(_time, delta) {
    const dt = Math.min(.034, delta / 1000);
    const axis = this.controls.axis();
    const player = this.playerState;
    player.x = Phaser.Math.Clamp(player.x + axis * GAME_CONFIG.moveSpeed * dt, 30, GAME_CONFIG.worldWidth - 30);
    player.dir = axis < 0 ? -1 : axis > 0 ? 1 : player.dir;
    player.moving = axis !== 0;
    this.cameras.main.setLerp(Math.min(1, dt * GAME_CONFIG.cameraFollowSpeed), 1);
    this.updatePlayerSprite();
    this.updateNearby();
  }

  updatePlayerSprite() {
    const player = this.playerState;
    if (this.customPlayer) {
      // Bottom-center origin anchors the feet to the configured walking lane.
      this.playerSprite.setPosition(Math.round(player.x), player.y + GAME_CONFIG.playerFootOffset);
      this.playerSprite.setFlipX(CANVAS_ITEMS.player.facing === "right" ? player.dir > 0 : player.dir < 0);
      if (this.playerSheet) {
        if (player.moving && !this.reducedMotion) this.playerSprite.play("player-walk", true);
        else this.playerSprite.stop().setFrame(CANVAS_ITEMS.player.idleFrame ?? 0);
      }
    } else {
      this.playerSprite.setPosition(Math.round(player.x) - 16 - ART_PADDING, player.y - 30 - ART_PADDING);
      const direction = player.dir < 0 ? "left" : "right";
      if (player.moving && !this.reducedMotion) this.playerSprite.play(`walk-${direction}`, true);
      else this.playerSprite.stop().setTexture(`player-${direction}-0`);
    }
  }

  updateNearby() {
    let nearest = null;
    let bestDistance = Infinity;
    for (const hotspot of this.hotspots) {
      const distance = Math.abs(this.playerState.x - hotspot.x);
      if (distance < hotspot.r + GAME_CONFIG.interactionPadding && distance < bestDistance) {
        nearest = hotspot;
        bestDistance = distance;
      }
    }
    if (nearest === this.nearby) return;
    this.nearby = nearest;
    this.ui.syncPrompt(this.nearby, this.found);
    this.updateHighlight();
  }

  updateHighlight() {
    this.highlightTween?.remove();
    this.highlightTween = null;
    this.highlight.setScale(1).setVisible(Boolean(this.nearby));
    if (!this.nearby) return;
    const hotspot = this.nearby;
    const texture = hotspotTexture(this, hotspot.r);
    this.highlight.setTexture(texture.key).setPosition(
      Math.round(hotspot.x - hotspot.r * .56) + texture.width / 2,
      Math.round(hotspot.y - hotspot.r * .45) + texture.height / 2,
    );
    if (!this.reducedMotion) this.highlightTween = this.tweens.add({
      targets: this.highlight, scale: 1.03, duration: 280, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    });
  }

  inspect() {
    const target = this.nearby;
    if (!target) {
      this.ui.setDialog("Nothing close enough yet", "Take a few more steps toward something interesting.");
      return;
    }
    this.found.add(target.id);
    this.ui.syncProgress(this.found, this.hotspots.length);
    this.ui.syncPrompt(target, this.found);
    this.ui.setDialog(target.name, target.text + (this.found.size === this.hotspots.length
      ? " You also found everything in the room. Nice work!" : ""));
    this.ui.dom.dialog.scrollIntoView({ behavior: this.reducedMotion ? "auto" : "smooth", block: "nearest" });
  }
}
