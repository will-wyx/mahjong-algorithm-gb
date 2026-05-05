import {
  parseTiles,
  parseHandDetailed,
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
  getRegularShanten,
  getSevenPairsShanten,
  getThirteenOrphansShanten,
  getUsefulTiles,
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
  parseHandDetailed,
  tilesToString,
  handToString,
  getRegularShanten,
  getSevenPairsShanten,
  getThirteenOrphansShanten,
  getUsefulTiles,
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
  const result = parseHandDetailed(text);
  return result.error === 0 ? { ok: true, ...result } : { ok: false, error: result.error };
};

/**
 * 将手牌字符串规范化。
 * @param {string} text - 手牌字符串
 * @returns {Object} 包含 ok 和规范化后的 hand 字符串
 */
export const stringifyHand = (text) => {
  const result = parseHandDetailed(text);
  return result.error === 0 ? { ok: true, hand: handToString(result.hand) } : { ok: false, error: result.error };
};

/**
 * 计算各种和牌方式下的向听数及有效进张。
 * @param {string} text - 手牌字符串
 * @returns {Object} 包含向听数及有效牌数组
 */
export const calculateShanten = (text) => {
  const result = parseHandDetailed(text);
  if (result.error !== 0) return { ok: false, error: result.error };
  const tiles = result.hand.standingTiles;
  return {
    ok: true,
    regular: getRegularShanten(tiles),
    sevenPairs: getSevenPairsShanten(tiles),
    thirteenOrphans: getThirteenOrphansShanten(tiles),
    regularUseful: getUsefulTiles(tiles, getRegularShanten),
    sevenPairsUseful: getUsefulTiles(tiles, getSevenPairsShanten),
    thirteenOrphansUseful: getUsefulTiles(tiles, getThirteenOrphansShanten)
  };
};

/**
 * 计算番数的主入口。
 * @param {string} text - 手牌字符串
 * @param {Object} options - 计算参数（如 selfDrawn, prevalentWind, seatWind）
 * @returns {Object} 算番结果
 */
export const calculateFan = (text, options = {}) => {
  const result = parseHandDetailed(text);
  if (result.error !== 0) return { ok: false, error: result.error };
  return calculateFanTable(result.hand, options);
};
