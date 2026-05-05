import {
  parseTiles,
  stringToTilesDetailed,
  tilesToString,
  handToString,
  PARSE_NO_ERROR,
  PARSE_ERROR_ILLEGAL_CHARACTER,
  PARSE_ERROR_SUFFIX,
  PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK,
  PARSE_ERROR_CANNOT_MAKE_FIXED_PACK,
  PARSE_ERROR_TOO_MANY_FIXED_PACKS,
  PARSE_ERROR_TOO_MANY_TILES,
  PARSE_ERROR_TILE_COUNT_GREATER_THAN_4
} from './stringify.js';
import {
  regularShanten,
  sevenPairsShanten,
  thirteenOrphansShanten,
  usefulTilesFor,
  isRegularWin
} from './shanten.js';
import { calculateFanTable, FAN_VALUE } from './fan.js';

export {
  PARSE_NO_ERROR,
  PARSE_ERROR_ILLEGAL_CHARACTER,
  PARSE_ERROR_SUFFIX,
  PARSE_ERROR_WRONG_TILES_COUNT_FOR_FIXED_PACK,
  PARSE_ERROR_CANNOT_MAKE_FIXED_PACK,
  PARSE_ERROR_TOO_MANY_FIXED_PACKS,
  PARSE_ERROR_TOO_MANY_TILES,
  PARSE_ERROR_TILE_COUNT_GREATER_THAN_4,
  parseTiles,
  stringToTilesDetailed,
  tilesToString,
  handToString,
  regularShanten,
  sevenPairsShanten,
  thirteenOrphansShanten,
  usefulTilesFor,
  isRegularWin,
  calculateFanTable,
  FAN_VALUE
};

/**
 * 解析手牌字符串。
 * @param {string} text - 手牌字符串
 * @returns {Object} 包含 ok 和 hand 对象
 */
export const parseHand = (text) => {
  const r = stringToTilesDetailed(text);
  return r.error === 0 ? { ok: true, ...r } : { ok: false, error: r.error };
};

/**
 * 将手牌字符串规范化。
 * @param {string} text - 手牌字符串
 * @returns {Object} 包含 ok 和规范化后的 hand 字符串
 */
export const stringifyHand = (text) => {
  const r = stringToTilesDetailed(text);
  return r.error === 0 ? { ok: true, hand: handToString(r.hand) } : { ok: false, error: r.error };
};

/**
 * 计算各种和牌方式下的向听数及有效进张。
 * @param {string} text - 手牌字符串
 * @returns {Object} 包含向听数及有效牌数组
 */
export const calculateShanten = (text) => {
  const r = stringToTilesDetailed(text);
  if (r.error !== 0) return { ok: false, error: r.error };
  const t = r.hand.standing_tiles;
  return {
    ok: true,
    regular: regularShanten(t),
    sevenPairs: sevenPairsShanten(t),
    thirteenOrphans: thirteenOrphansShanten(t),
    regularUseful: usefulTilesFor(t, regularShanten),
    sevenPairsUseful: usefulTilesFor(t, sevenPairsShanten),
    thirteenOrphansUseful: usefulTilesFor(t, thirteenOrphansShanten)
  };
};

/**
 * 计算番数的主入口。
 * @param {string} text - 手牌字符串
 * @param {Object} options - 计算参数（如 selfDrawn, prevalentWind, seatWind）
 * @returns {Object} 算番结果
 */
export const calculateFan = (text, options = {}) => {
  const r = stringToTilesDetailed(text);
  if (r.error !== 0) return { ok: false, error: r.error };
  return calculateFanTable(r.hand, options);
};
