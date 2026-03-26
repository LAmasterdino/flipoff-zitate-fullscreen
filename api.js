import { API_ENDPOINT, DAILY_CACHE_KEY, DAILY_QUOTE_COUNT, FALLBACK_QUOTES, MAX_QUOTE_LENGTH } from "./constants.js";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeStorage() {
  try {
    const key = "__flipoff_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return localStorage;
  } catch {
    return null;
  }
}

const storage = safeStorage();

function readCache() {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DAILY_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  if (!storage) return;
  try {
    storage.setItem(DAILY_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode errors
  }
}

function normalizeQuote(item) {
  const content = String(item?.content ?? item?.quote ?? "").replace(/\s+/g, " ").trim();
  const author = String(item?.author ?? item?.name ?? "Anonymous").replace(/\s+/g, " ").trim();
  return { content, author };
}

function dedupe(quotes) {
  const seen = new Set();
  const out = [];
  for (const q of quotes) {
    const key = `${q.content.toLowerCase()}|${q.author.toLowerCase()}`;
    if (!q.content || !q.author || seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

async function fetchBatch(limit) {
  const url = new URL(API_ENDPOINT);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("maxLength", String(MAX_QUOTE_LENGTH));
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Quote API request failed (${response.status})`);
  }

  const data = await response.json();
  const list = Array.isArray(data) ? data : [data];
  return dedupe(list.map(normalizeQuote));
}

function topUpFromFallback(existing, desiredCount) {
  const merged = [...existing];
  const seen = new Set(merged.map((q) => `${q.content.toLowerCase()}|${q.author.toLowerCase()}`));
  for (const q of FALLBACK_QUOTES) {
    const normalized = normalizeQuote(q);
    const key = `${normalized.content.toLowerCase()}|${normalized.author.toLowerCase()}`;
    if (!seen.has(key)) {
      merged.push(normalized);
      seen.add(key);
    }
    if (merged.length >= desiredCount) break;
  }
  return merged.slice(0, desiredCount);
}

async function refetchUntilEnough(desiredCount) {
  const attempts = [];
  for (let i = 0; i < 3 && attempts.flat().length < desiredCount; i += 1) {
    try {
      const chunk = await fetchBatch(Math.min(DAILY_QUOTE_COUNT, desiredCount - attempts.flat().length));
      attempts.push(chunk);
    } catch {
      break;
    }
  }
  const merged = dedupe(attempts.flat());
  return merged.length >= desiredCount ? merged.slice(0, desiredCount) : topUpFromFallback(merged, desiredCount);
}

export async function loadDailyQuotes() {
  const cached = readCache();
  const today = todayKey();

  if (cached?.date === today && Array.isArray(cached.quotes) && cached.quotes.length) {
    return cached.quotes.slice(0, DAILY_QUOTE_COUNT);
  }

  let quotes;
  try {
    quotes = await fetchBatch(DAILY_QUOTE_COUNT);
    if (quotes.length < DAILY_QUOTE_COUNT) {
      quotes = await refetchUntilEnough(DAILY_QUOTE_COUNT);
    }
  } catch {
    quotes = cached?.quotes?.length ? cached.quotes : topUpFromFallback([], DAILY_QUOTE_COUNT);
  }

  const payload = { date: today, quotes: quotes.slice(0, DAILY_QUOTE_COUNT) };
  writeCache(payload);
  return payload.quotes;
}
