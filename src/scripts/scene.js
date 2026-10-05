// Immutable authoring data shared by the page and browser game

export const DRAWN_ITEMS = new Set(["pictures", "bookshelf"]);

export const GAME_CONFIG = Object.freeze({
  viewportWidth: 1280,
  viewportHeight: 320,
  worldWidth: 1280,
  worldHeight: 320,
  floorTop: 252,
  playerStartX: 380,
  playerY: 244,
  playerFootOffset: 48,
  moveSpeed: 150,
  cameraAnchor: .48,
  cameraFollowSpeed: 7,
  interactionPadding: 54
});

export const CANVAS_ITEMS = {
  window: {
    src: "window.png",
    x: 46,
    y: 49,
    w: 128,
    h: 128,
    layer: 10
  },

  table: { src: "table.webp", x: 100, y: 190, w: 300, h: 100, layer: 20 },

  computer: { src: "monitor.png", x: 155, y: 158, w: 129, h: 66, layer: 30 },

  dice: {
    src: "dice.png",
    x: 280,
    y: 190,
    w: 32,
    h: 32,
    layer: 32
  },

  controllers: {
    src: "controller.webp",
    x: 320,
    y: 194,
    w: 32,
    h: 32,
    layer: 41
  },
  pictures: {
    src: null,
    x: 330,
    y: 62,
    w: 200,
    h: 64,
  },

  dog: { src: "dog.webp", x: 428, y: 228, w: 44, h: 44, layer: 30 },

  bed: { src: "bed.webp", x: 620, y: 210, w: 224, h: 74.67, layer: 20 },

  lamp: { src: "lamp.webp", x: 505, y: 126, w: 48, h: 144, layer: 20 },

  bookshelf: {
    src: null,
    x: 920,
    y: 92,
    w: 156,
    h: 192,
    layer: 20
  },
  player: {
    src: 'hornet-walking.webp',
    frameWidth: 36, frameHeight: 36, frameCount: 5,
    frameRate: 10, idleFrame: 0, facing: 'right',
    x: 0, y: 0, w: 72, h: 72, layer: 100
  }
};
Object.keys(CANVAS_ITEMS).forEach(function (id) { Object.freeze(CANVAS_ITEMS[id]); });
Object.freeze(CANVAS_ITEMS);

export const HOTSPOT_DEFINITIONS = Object.freeze([
  {
    id: 'window',
    visualId: 'window',
    anchorX: .309,
    anchorY: .764,
    r: 92,
    name: 'Window',
    text: 'Towering apartment buildings stretch out to a hazy New York skyline. You hear the 7 train squeal past.'
  },
  {
    id: 'table',
    visualId: 'table',
    anchorX: .423,
    anchorY: .062,
    r: 78,
    name: 'Computer desk',
    text: 'A desk with an ecclectic assortment of items. You see a variety of tiny kirby figures, a speakers, headphones, and two half filled mugs of forgotten coffee.'
  },
  {
    id: 'computer',
    visualId: 'computer',
    anchorX: .406,
    anchorY: .347,
    r: 70,
    name: 'Computer monitor',
    text: 'A computer can say a lot about a person...you probably should not touch it.'
  },
  {
    id: 'dice',
    visualId: 'dice',
    anchorX: .211,
    anchorY: .611,
    r: 55,
    name: 'Dice',
    text: 'A twenty sided dice. You think if you shake it, it could also double as a glitter snowglobe.'
  },
  {
    id: 'dog',
    visualId: 'dog',
    anchorX: .467,
    anchorY: .677,
    r: 68,
    name: 'A loaf',
    text: 'A small fluff ball stares at you. Upon closer inspection, you realize it is a dog. She stares lovingly at you, eyes begging for a treat.'
  },
  {
    id: 'bed',
    visualId: 'bed',
    anchorX: .456,
    anchorY: .474,
    r: 108,
    name: 'Bed',
    text: 'The bed has a light blue quilt tucked messily underneath the mattress. Underneath is an abyss you dare not touch.'
  },
  {
    id: 'bookshelf',
    visualId: 'bookshelf',
    anchorX: .5,
    anchorY: .69,
    r: 94,
    name: 'Bookshelf',
    text: 'Each shelf seems organized by category, although the category seems to be mostly fantasy (with some cooking and computer science sprinkled in).'
  }
].map(function (definition) { return Object.freeze(definition); }));
