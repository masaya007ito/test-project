document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const clearBtn = document.getElementById("clear-btn");
  const sizeSlider = document.getElementById("size-slider");
  const sizeLabel = document.getElementById("size-label");
  const paletteButtons = document.querySelectorAll(".sticker-btn");

  let selectedSticker = null;

  paletteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      paletteButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSticker = btn.dataset.sticker;
    });
  });

  sizeSlider.addEventListener("input", () => {
    sizeLabel.textContent = sizeSlider.value + "px";
  });

  canvas.addEventListener("click", (e) => {
    if (e.target !== canvas || !selectedSticker) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = parseInt(sizeSlider.value, 10);

    placeSticker(selectedSticker, x - size / 2, y - size / 2, size);
  });

  function placeSticker(emoji, x, y, size) {
    const el = document.createElement("span");
    el.className = "placed-sticker";
    el.textContent = emoji;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.fontSize = size + "px";
    canvas.appendChild(el);
    makeDraggable(el);
  }

  function makeDraggable(el) {
    let offsetX, offsetY;

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add("dragging");
      el.setPointerCapture(e.pointerId);

      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      function onMove(ev) {
        const newX = ev.clientX - canvasRect.left - offsetX;
        const newY = ev.clientY - canvasRect.top - offsetY;
        el.style.left = newX + "px";
        el.style.top = newY + "px";
      }

      function onUp() {
        el.classList.remove("dragging");
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      }

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    });
  }

  clearBtn.addEventListener("click", () => {
    canvas.querySelectorAll(".placed-sticker").forEach((s) => s.remove());
  });
});
