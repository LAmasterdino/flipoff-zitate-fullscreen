import { QUOTE_INTERVAL_MS } from "./constants.js";

export class MessageRotator {
  constructor(board, quotes) {
    this.board = board;
    this.quotes = quotes;
    this.index = 0;
    this.timer = null;
  }

  current() {
    return this.quotes[this.index] ?? this.quotes[0];
  }

  showCurrent({ animate = true } = {}) {
    const quote = this.current();
    if (quote) this.board.setQuote(quote, { animate });
  }

  next() {
    this.index = (this.index + 1) % this.quotes.length;
    this.showCurrent({ animate: true });
  }

  previous() {
    this.index = (this.index - 1 + this.quotes.length) % this.quotes.length;
    this.showCurrent({ animate: true });
  }

  start() {
    this.stop();
    this.timer = window.setInterval(() => this.next(), QUOTE_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset(quotes) {
    this.quotes = quotes;
    this.index = 0;
    this.showCurrent({ animate: false });
    this.start();
  }
}
