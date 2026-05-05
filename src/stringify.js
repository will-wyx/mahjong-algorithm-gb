export const PARSE_NO_ERROR = 0;
export const PARSE_ERROR_ILLEGAL_CHARACTER = -1;
export const PARSE_ERROR_SUFFIX = -2;
export const PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK = -3;
export const PARSE_ERROR_CANNOT_MAKE_FIXED_PACK = -4;
export const PARSE_ERROR_TOO_MANY_FIXED_PACKS = -5;
export const PARSE_ERROR_TOO_MANY_TILES = -6;
export const PARSE_ERROR_TILE_COUNT_GREATER_THAN_4 = -7;

const SUITS = ['m', 's', 'p'];
const HONORS = ['E', 'S', 'W', 'N', 'C', 'F', 'P'];

function expandDigits(digits, suit) {
  return [...digits].map((d) => `${d}${suit}`);
}

function isTile(t) {
  return /^[1-9][msp]$/.test(t) || /^[ESWNCFP]$/.test(t);
}

export function parseTiles(text) {
  const tiles = [];
  let digits = '';
  const clean = text.replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch >= '1' && ch <= '9') {
      digits += ch;
    } else if (SUITS.includes(ch)) {
      if (!digits) return { error: PARSE_ERROR_SUFFIX };
      tiles.push(...expandDigits(digits, ch));
      digits = '';
    } else if (HONORS.includes(ch)) {
      if (digits) return { error: PARSE_ERROR_SUFFIX };
      tiles.push(ch);
    } else {
      return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
    }
  }
  if (digits) return { error: PARSE_ERROR_SUFFIX };
  return { error: PARSE_NO_ERROR, tiles };
}

function parsePack(content) {
  const m = content.match(/^([^,\]]+)(?:,([1-7]))?$/);
  if (!m) return { error: PARSE_ERROR_CANNOT_MAKE_FIXED_PACK };
  const tilesRet = parseTiles(m[1]);
  if (tilesRet.error !== 0) return tilesRet;
  if (tilesRet.tiles.length < 3 || tilesRet.tiles.length > 4) return { error: PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK };
  return { error: 0, tiles: tilesRet.tiles, offer: m[2] ? Number(m[2]) : 0 };
}

export function stringToTilesDetailed(text) {
  const hand = { fixed_packs: [], standing_tiles: [] };
  let i = 0;
  let rest = '';
  while (i < text.length) {
    if (text[i] === '[') {
      const j = text.indexOf(']', i + 1);
      if (j < 0) return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
      if (hand.fixed_packs.length >= 4) return { error: PARSE_ERROR_TOO_MANY_FIXED_PACKS };
      const p = parsePack(text.slice(i + 1, j));
      if (p.error !== 0) return { error: p.error };
      hand.fixed_packs.push(p);
      i = j + 1;
    } else {
      rest += text[i++];
    }
  }
  const parsed = parseTiles(rest);
  if (parsed.error !== 0) return { error: parsed.error };
  hand.standing_tiles = parsed.tiles;

  const all = [...hand.standing_tiles, ...hand.fixed_packs.flatMap((x) => x.tiles)];
  if (all.length > 14) return { error: PARSE_ERROR_TOO_MANY_TILES };
  const cnt = new Map();
  for (const t of all) {
    if (!isTile(t)) return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
    cnt.set(t, (cnt.get(t) || 0) + 1);
    if (cnt.get(t) > 4) return { error: PARSE_ERROR_TILE_COUNT_GREATER_THAN_4 };
  }

  return {
    error: 0,
    hand,
    serving_tile: hand.standing_tiles.length % 3 === 2 ? hand.standing_tiles[hand.standing_tiles.length - 1] : null
  };
}

export function tilesToString(tiles) {
  const suitBuckets = { m: [], s: [], p: [] };
  const honors = [];
  for (const t of tiles) {
    if (t.length === 2) suitBuckets[t[1]].push(t[0]); else honors.push(t);
  }
  const parts = [];
  for (const s of ['m', 's', 'p']) if (suitBuckets[s].length) parts.push(suitBuckets[s].sort().join('') + s);
  if (honors.length) parts.push(honors.join(''));
  return parts.join('');
}

export function handToString(hand) {
  const packs = hand.fixed_packs.map((p) => `[${tilesToString(p.tiles)}${p.offer ? ',' + p.offer : ''}]`).join('');
  return `${packs}${tilesToString(hand.standing_tiles)}`;
}
