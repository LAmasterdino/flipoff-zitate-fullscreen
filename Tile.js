import { SCRAMBLE_CHARS, SCRAMBLE_DURATION_MS, SCRAMBLE_STEPS } from "./constants.js";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] ?? " ";
}

export class Tile {
  constructor() {
    this.el = document.createElement("div");
    this.el.className = "tile is-empty";

    this.glyph = document.createElement("span");
    this.glyph.className = "tile__glyph";
    this.glyph.textContent = " ";

    this.el.append(this.glyph);

    this.current = " ";
    this.timer = null;
  }

  setChar(char, { animate = true } = {}) {
    const next = char && char.length ? char[0] : " ";
    if (!animate) {
      this.current = next;
      this.glyph.textContent = next;
      this.el.classList.toggle("is-empty", next === " ");
      this.el.classList.remove("is-flipping");
      return;
    }

    if (next === this.current) {
      this.el.classList.toggle("is-empty", next === " ");
      return;
    }

    this.el.classList.add("is-flipping");
    this.el.dataset.scramble = "1";

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const stepDuration = Math.max(24, Math.floor(SCRAMBLE_DURATION_MS / SCRAMBLE_STEPS));
    let step = 0;

    this.timer = window.setInterval(() => {
      step += 1;
      const finalStep = step >= SCRAMBLE_STEPS;
      const display = finalStep ? next : randomChar();

      this.glyph.textContent = display;
      this.el.classList.toggle("is-empty", display === " ");

      if (finalStep) {
        clearInterval(this.timer);
        this.timer = null;
        this.current = next;
        this.glyph.textContent = next;
        this.el.classList.remove("is-flipping");
        this.el.dataset.scramble = "0";
        setTimeout(() => {
          this.el.classList.remove("is-flipping");
        }, 10);
      }
    }, stepDuration);
  }
}
