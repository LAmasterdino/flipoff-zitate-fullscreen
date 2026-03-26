export const API_ENDPOINT = "https://api.quotable.io/quotes/random";
export const DAILY_CACHE_KEY = "flipoff.daily-quotes.v1";
export const DAILY_QUOTE_COUNT = 10;
export const QUOTE_INTERVAL_MS = 60_000;
export const SCRAMBLE_DURATION_MS = 420;
export const SCRAMBLE_STEPS = 8;
export const MAX_QUOTE_LENGTH = 140;

export const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;!?…—–/'"()[]{}#+*=<>@%&";

export const FALLBACK_QUOTES = [
  { content: "The future belongs to those who build it.", author: "Anonymous" },
  { content: "Small details make a large display feel alive.", author: "Anonymous" },
  { content: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { content: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { content: "Design is intelligence made visible.", author: "Alina Wheeler" },
  { content: "What gets measured gets improved.", author: "Peter Drucker" },
  { content: "Good systems are boring in the best way.", author: "Anonymous" },
  { content: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { content: "A display becomes memorable when it feels inevitable.", author: "Anonymous" },
  { content: "Build for the room, not for the keyboard.", author: "Anonymous" },
];
