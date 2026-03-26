import { loadDailyQuotes } from "./api.js";
import { Board } from "./Board.js";
import { KeyboardController } from "./KeyboardController.js";
import { MessageRotator } from "./MessageRotator.js";

const app = document.getElementById("app");
const boardEl = document.getElementById("board");
const hitbox = document.getElementById("fullscreen-hitbox");
const bootMessage = document.getElementById("boot-message");

const state = {
  board: new Board(boardEl),
  rotator: null,
  loaded: false,
};

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

async function enterFullscreen() {
  if (isFullscreen()) return;
  const target = document.documentElement;
  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen({ navigationUI: "hide" });
    } else if (target.webkitRequestFullscreen) {
      await target.webkitRequestFullscreen();
    }
  } catch {
    // browsers may block without a user gesture
  }
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  } catch {
    // ignore
  }
}

function syncReadyState() {
  app.classList.toggle("is-ready", state.loaded);
}

async function boot() {
  state.board.clear();

  const quotes = await loadDailyQuotes();
  state.rotator = new MessageRotator(state.board, quotes);
  state.rotator.showCurrent({ animate: false });
  state.rotator.start();
  state.loaded = true;
  syncReadyState();
}

const keyboard = new KeyboardController({
  onNext: () => state.rotator?.next(),
  onPrevious: () => state.rotator?.previous(),
  onToggleFullscreen: () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  },
  onExitFullscreen: () => exitFullscreen(),
});

hitbox.addEventListener("click", async () => {
  if (!state.loaded) return;
  await enterFullscreen();
});

window.addEventListener("resize", () => {
  if (state.rotator?.current()) {
    state.board.setQuote(state.rotator.current(), { animate: false });
  }
});

document.addEventListener("fullscreenchange", () => {
  bootMessage.textContent = isFullscreen()
    ? "Vollbild aktiv — Enter/Space: nächstes Zitat · Pfeile: zurück/vor · F: Vollbild"
    : "Klick oder drücke F für Vollbild";
});

document.addEventListener("webkitfullscreenchange", () => {
  bootMessage.textContent = isFullscreen()
    ? "Vollbild aktiv — Enter/Space: nächstes Zitat · Pfeile: zurück/vor · F: Vollbild"
    : "Klick oder drücke F für Vollbild";
});

document.fonts?.ready?.then(() => boot()) ?? boot();

window.addEventListener("beforeunload", () => {
  keyboard.destroy();
  state.rotator?.stop();
});
