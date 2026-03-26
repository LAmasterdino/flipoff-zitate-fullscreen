export class KeyboardController {
  constructor({ onNext, onPrevious, onToggleFullscreen, onExitFullscreen }) {
    this.onNext = onNext;
    this.onPrevious = onPrevious;
    this.onToggleFullscreen = onToggleFullscreen;
    this.onExitFullscreen = onExitFullscreen;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener("keydown", this.handleKeyDown, { passive: false });
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    if (key === "f") {
      event.preventDefault();
      this.onToggleFullscreen?.();
      return;
    }

    if (key === "escape") {
      this.onExitFullscreen?.();
      return;
    }

    if (key === " " || key === "enter" || key === "arrowright") {
      event.preventDefault();
      this.onNext?.();
      return;
    }

    if (key === "arrowleft") {
      event.preventDefault();
      this.onPrevious?.();
      return;
    }
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}
