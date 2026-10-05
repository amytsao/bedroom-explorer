const MOVEMENT_CODES = new Set(["ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);

function isInteractiveTarget(target) {
  return target instanceof Element && Boolean(target.closest(
    'button, a, input, textarea, select, summary, [contenteditable="true"]',
  ));
}

export function bindGameInput(scene, ui) {
  const keyboard = scene.input.keyboard;
  const gameEvents = scene.game.events;
  const keyboardKeys = new Set();
  const touchKeys = new Set();
  const controls = [...document.querySelectorAll(".touch [data-key]")];
  const abort = new AbortController();
  const listen = (target, name, handler) => target.addEventListener(name, handler, { signal: abort.signal });
  const reset = () => {
    keyboardKeys.clear();
    touchKeys.clear();
    controls.forEach(button => button.classList.remove("pressed"));
  };
  const keydown = event => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || isInteractiveTarget(event.target)) return;
    if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
    if (MOVEMENT_CODES.has(event.code)) keyboardKeys.add(event.code);
    if (event.code === "Space" && !event.repeat) scene.inspect();
  };
  const keyup = event => keyboardKeys.delete(event.code);

  // Phaser owns keyboard dispatch; capture is disabled to respect normal page controls.
  keyboard.on("keydown", keydown);
  keyboard.on("keyup", keyup);
  gameEvents.on("blur", reset);
  gameEvents.on("hidden", reset);
  listen(document, "focusin", event => {
    if (isInteractiveTarget(event.target)) keyboardKeys.clear();
  });

  for (const button of controls) {
    const code = button.dataset.key;
    listen(button, "pointerdown", event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      touchKeys.add(code);
      button.classList.add("pressed");
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
      listen(button, name, event => {
        event.preventDefault();
        touchKeys.delete(code);
        button.classList.remove("pressed");
      });
    }
  }
  listen(ui.dom.inspectBtn, "click", () => scene.inspect());

  return {
    axis() {
      const down = code => keyboardKeys.has(code) || touchKeys.has(code);
      return Number(down("ArrowRight") || down("KeyD")) - Number(down("ArrowLeft") || down("KeyA"));
    },
    dispose() {
      reset();
      abort.abort();
      keyboard.off("keydown", keydown);
      keyboard.off("keyup", keyup);
      gameEvents.off("blur", reset);
      gameEvents.off("hidden", reset);
    },
  };
}
