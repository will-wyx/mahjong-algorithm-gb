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

/**
 * 展开数字简写，如 expandDigits('123', 'm') -> ['1m', '2m', '3m']
 * @param {string} digits - 数字字符串
 * @param {string} suit - 后缀花色
 * @returns {string[]} 展开后的牌数组
 */
function expandDigits(digits, suit) {
  return [...digits].map((digit) => `${digit}${suit}`);
}

/**
 * 校验是否为合法的牌字符串。
 * @param {string} tile - 待校验的牌字符串
 * @returns {boolean} 是否合法
 */
function isTile(tile) {
  return /^[1-9][msp]$/.test(tile) || /^[ESWNCFP]$/.test(tile);
}

/**
 * 解析基础牌字符串（不含副露括号）。
 * @param {string} text - 牌字符串，如 '123m456s789pESWNCFP'
 * @returns {Object} 包含 error 和 tiles 数组
 */
export function parseTiles(text) {
  const tiles = [];
  let digits = '';
  const cleanText = text.replace(/\s+/g, '');
  for (const char of cleanText) {
    if (char >= '1' && char <= '9') {
      digits += char;
    } else if (SUITS.includes(char)) {
      if (!digits) return { error: PARSE_ERROR_SUFFIX };
      tiles.push(...expandDigits(digits, char));
      digits = '';
    } else if (HONORS.includes(char)) {
      if (digits) return { error: PARSE_ERROR_SUFFIX };
      tiles.push(char);
    } else {
      return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
    }
  }
  if (digits) return { error: PARSE_ERROR_SUFFIX };
  return { error: PARSE_NO_ERROR, tiles };
}

/**
 * 解析单个副露（括号内的内容），如 '123m,1' 表示 123m 顺子，1 号位被供牌。
 * @param {string} content - 副露内容字符串
 * @returns {Object} 包含 error, tiles 数组和 offer 位置的对象
 */
function parsePack(content) {
  // 兼容两种供牌位写法：
  // 1) [123m,1]
  // 2) [123m1]（与 C++ 测试数据兼容）
  const match = content.match(/^([^,\]]+?)(?:,([1-7])|([1-7]))?$/);
  if (!match) return { error: PARSE_ERROR_CANNOT_MAKE_FIXED_PACK };
  const tileExpr = match[1];
  const offer = match[2] || match[3] || null;
  const { error, tiles } = parseTiles(tileExpr);
  if (error !== 0) return { error };
  if (tiles.length < 3 || tiles.length > 4) return { error: PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK };
  return { error: 0, tiles, offer: offer ? Number(offer) : 0 };
}

/**
 * 解析完整手牌字符串（支持副露括号）。
 * 格式示例：'[123m][456s,1]789pEECC'
 * @param {string} text - 完整手牌字符串
 * @returns {Object} 包含 error, hand 对象（fixedPacks, standingTiles）和 servingTile
 */
export function parseHandDetailed(text) {
  const hand = { fixedPacks: [], standingTiles: [] };
  let i = 0;
  let rest = '';
  while (i < text.length) {
    if (text[i] === '[') {
      const j = text.indexOf(']', i + 1);
      if (j < 0) return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
      if (hand.fixedPacks.length >= 4) return { error: PARSE_ERROR_TOO_MANY_FIXED_PACKS };
      const pack = parsePack(text.slice(i + 1, j));
      if (pack.error !== 0) return { error: pack.error };
      hand.fixedPacks.push(pack);
      i = j + 1;
    } else {
      rest += text[i++];
    }
  }
  const parsed = parseTiles(rest);
  if (parsed.error !== 0) return { error: parsed.error };
  hand.standingTiles = parsed.tiles;

  // 全局校验
  const allTiles = [...hand.standingTiles, ...hand.fixedPacks.flatMap((x) => x.tiles)];
  // 与 C++ 兼容：杠在字符串里按 4 张表示，但手牌有效张数按 3 张面子计算
  const effectiveTileCount = hand.standingTiles.length
    + hand.fixedPacks.reduce((sum, pack) => sum + (pack.tiles.length === 4 ? 3 : pack.tiles.length), 0);
  if (effectiveTileCount > 14) return { error: PARSE_ERROR_TOO_MANY_TILES };
  
  const counts = new Map();
  for (const tile of allTiles) {
    if (!isTile(tile)) return { error: PARSE_ERROR_ILLEGAL_CHARACTER };
    const count = (counts.get(tile) || 0) + 1;
    if (count > 4) return { error: PARSE_ERROR_TILE_COUNT_GREATER_THAN_4 };
    counts.set(tile, count);
  }

  return {
    error: 0,
    hand,
    /** 如果是 14 张牌，则最后一张被视为“和牌张” */
    servingTile: hand.standingTiles.length % 3 === 2 ? hand.standingTiles[hand.standingTiles.length - 1] : null
  };
}

/**
 * 将牌数组转换为简写字符串，如 ['1m', '2m', '3m'] -> '123m'。
 * @param {string[]} tiles - 牌数组
 * @returns {string} 简写字符串
 */
export function tilesToString(tiles) {
  const suitBuckets = { m: [], s: [], p: [] };
  const honors = [];
  for (const tile of tiles) {
    if (tile.length === 2) suitBuckets[tile[1]].push(tile[0]); else honors.push(tile);
  }
  const parts = [];
  for (const suit of ['m', 's', 'p']) {
    if (suitBuckets[suit].length) parts.push(suitBuckets[suit].sort().join('') + suit);
  }
  if (honors.length) parts.push(honors.join(''));
  return parts.join('');
}

/**
 * 将完整手牌对象转换为字符串表示。
 * @param {Object} hand - 手牌对象
 * @returns {string} 字符串表示
 */
export function handToString(hand) {
  const packsString = hand.fixedPacks.map((pack) => `[${tilesToString(pack.tiles)}${pack.offer ? ',' + pack.offer : ''}]`).join('');
  return `${packsString}${tilesToString(hand.standingTiles)}`;
}
