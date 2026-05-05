/** 成功解析，无错误 */
export const PARSE_NO_ERROR = 0;
/** 解析错误：非法字符 */
export const PARSE_ERROR_ILLEGAL_CHARACTER = -1;
/** 解析错误：缺少后缀（如 '123' 后面没有 'm'） */
export const PARSE_ERROR_SUFFIX = -2;
/** 解析错误：副露（Fixed Pack）牌数错误（只能是 3 或 4 张） */
export const PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK = -3;
/** 解析错误：无法构造副露 */
export const PARSE_ERROR_CANNOT_MAKE_FIXED_PACK = -4;
/** 解析错误：副露过多（最多 4 组） */
export const PARSE_ERROR_TOO_MANY_FIXED_PACKS = -5;
/** 解析错误：总张数过多（超过 14 张） */
export const PARSE_ERROR_TOO_MANY_TILES = -6;
/** 解析错误：单种牌超过 4 张 */
export const PARSE_ERROR_TILE_COUNT_GREATER_THAN_4 = -7;

/** 序数牌后缀 */
const SUITS = ['m', 's', 'p'];
/** 字牌名称 */
const HONORS = ['E', 'S', 'W', 'N', 'C', 'F', 'P'];

/** 展开数字简写，如 expandDigits('123', 'm') -> ['1m', '2m', '3m'] */
function expandDigits(digits, suit) {
  return [...digits].map((d) => `${d}${suit}`);
}

/** 校验是否为合法的牌字符串 */
function isTile(t) {
  return /^[1-9][msp]$/.test(t) || /^[ESWNCFP]$/.test(t);
}

/**
 * 解析基础牌字符串（不含副露括号）。
 * @param {string} text - 牌字符串，如 '123m456s789pESWNCFP'
 * @returns {Object} 包含 error 和 tiles 数组
 */
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

/** 解析单个副露（括号内的内容），如 '123m,1' 表示 123m 顺子，1 号位被供牌 */
function parsePack(content) {
  const m = content.match(/^([^,\]]+)(?:,([1-7]))?$/);
  if (!m) return { error: PARSE_ERROR_CANNOT_MAKE_FIXED_PACK };
  const tilesRet = parseTiles(m[1]);
  if (tilesRet.error !== 0) return tilesRet;
  if (tilesRet.tiles.length < 3 || tilesRet.tiles.length > 4) return { error: PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK };
  return { error: 0, tiles: tilesRet.tiles, offer: m[2] ? Number(m[2]) : 0 };
}

/**
 * 解析完整手牌字符串（支持副露括号）。
 * 格式示例：'[123m][456s,1]789pEECC'
 * @param {string} text - 完整手牌字符串
 * @returns {Object} 包含 error, hand 对象（fixed_packs, standing_tiles）和 serving_tile
 */
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

  // 全局校验
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
    /** 如果是 14 张牌，则最后一张被视为“和牌张” */
    serving_tile: hand.standing_tiles.length % 3 === 2 ? hand.standing_tiles[hand.standing_tiles.length - 1] : null
  };
}

/** 将牌数组转换为简写字符串，如 ['1m', '2m', '3m'] -> '123m' */
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

/** 将完整手牌对象转换为字符串表示 */
export function handToString(hand) {
  const packs = hand.fixed_packs.map((p) => `[${tilesToString(p.tiles)}${p.offer ? ',' + p.offer : ''}]`).join('');
  return `${packs}${tilesToString(hand.standing_tiles)}`;
}
