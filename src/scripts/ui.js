// Accessible Astro controls and descriptions remain outside the game canvas.
export function createGameUI() {
  const dom = Object.fromEntries([
    "dialog", "dialogTitle", "dialogText", "worldLabel", "foundCount", "totalCount", "progress", "inspectBtn",
  ].map(id => [id, document.getElementById(id)]));
  return {
    dom,
    setDialog(title, text) {
      dom.dialogTitle.textContent = title;
      dom.dialogText.textContent = text;
    },
    syncProgress(found, total) {
      dom.totalCount.textContent = String(total);
      dom.foundCount.textContent = String(found.size);
      dom.progress.max = total;
      dom.progress.value = found.size;
    },
    syncPrompt(nearby, found) {
      dom.worldLabel.hidden = !nearby;
      if (nearby) {
        dom.worldLabel.textContent = `SPACE · ${found.has(nearby.id) ? "revisit" : "inspect"} ${nearby.name.toLowerCase()}`;
      }
    },
  };
}
