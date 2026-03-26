import { Tile } from "./Tile.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wrapWords(text, maxWidth) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) lines.push(line);
    if (word.length <= maxWidth) {
      line = word;
      continue;
    }

    let chunk = "";
    for (const char of word) {
      if ((chunk + char).length > maxWidth) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk += char;
      }
    }
    line = chunk;
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function centerLine(line, width) {
  const trimmed = line.trim();
  if (trimmed.length >= width) return trimmed.slice(0, width);
  const totalPad = width - trimmed.length;
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return `${" ".repeat(left)}${trimmed}${" ".repeat(right)}`;
}

function compactQuote(quote) {
  return `${quote.content} — ${quote.author}`;
}

export class Board {
  constructor(element) {
    this.el = element;
    this.tiles = [];
    this.cols = 0;
    this.rows = 0;
    this.lastFrame = [];
  }

  measure() {
    const rect = this.el.getBoundingClientRect();
    const cols = clamp(Math.floor(rect.width / 30), 26, 54);
    const rows = clamp(Math.floor(rect.height / 44), 10, 18);
    return { cols, rows };
  }

  ensureGrid(cols, rows) {
    const needsRebuild = cols !== this.cols || rows !== this.rows || this.tiles.length !== cols * rows;
    if (!needsRebuild) return;

    this.cols = cols;
    this.rows = rows;
    this.el.innerHTML = "";
    this.tiles = [];
    this.el.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    this.el.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    this.el.dataset.rows = String(rows);
    this.el.dataset.cols = String(cols);

    for (let i = 0; i < cols * rows; i += 1) {
      const tile = new Tile();
      this.tiles.push(tile);
      this.el.append(tile.el);
    }
  }

  buildFrame(quote) {
    const { cols, rows } = this;
    const innerWidth = Math.max(12, cols - 8);

    const contentLines = wrapWords(quote.content.toUpperCase(), innerWidth);
    const authorLine = `— ${quote.author.toUpperCase()}`.trim();
    const authorFit = authorLine.length > innerWidth ? authorLine.slice(0, innerWidth) : authorLine;

    let lines = [...contentLines, "", authorFit];
    const maxBodyLines = rows - 2;

    if (lines.length > maxBodyLines) {
      const bodyWidth = Math.max(10, innerWidth - 2);
      const shortened = wrapWords(quote.content.toUpperCase(), bodyWidth);
      lines = [...shortened, "", authorFit];
    }

    if (lines.length > rows) {
      const keep = rows - 1;
      lines = [...lines.slice(0, keep), authorFit];
    }

    const frame = Array.from({ length: cols * rows }, () => " ");
    const startRow = Math.max(0, Math.floor((rows - lines.length) / 2));

    lines.forEach((line, lineIndex) => {
      const centered = centerLine(line, innerWidth);
      const padded = centerLine(centered, cols);
      const row = startRow + lineIndex;
      if (row < 0 || row >= rows) return;
      for (let col = 0; col < cols; col += 1) {
        frame[row * cols + col] = padded[col] ?? " ";
      }
    });

    return frame;
  }

  render(quote, { animate = true } = {}) {
    const { cols, rows } = this.measure();
    this.ensureGrid(cols, rows);

    const frame = this.buildFrame(quote);
    this.el.classList.toggle("is-transitioning", animate);

    frame.forEach((char, index) => {
      this.tiles[index].setChar(char, { animate });
    });

    this.lastFrame = frame;
    window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      this.el.classList.remove("is-transitioning");
    }, animate ? 500 : 0);
  }

  clear() {
    const blank = { content: "", author: "" };
    this.render(blank, { animate: false });
  }

  resizeIfNeeded() {
    if (!this.lastFrame.length) return;
    const { cols, rows } = this.measure();
    if (cols !== this.cols || rows !== this.rows) {
      const last = this.lastQuote ?? { content: "", author: "" };
      this.render(last, { animate: false });
    }
  }

  setQuote(quote, options = {}) {
    this.lastQuote = quote;
    this.render(quote, options);
  }
}
