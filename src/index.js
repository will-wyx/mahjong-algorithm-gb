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

export const parseHand = (text) => { const r = stringToTilesDetailed(text); return r.error === 0 ? { ok: true, ...r } : { ok: false, error: r.error }; };
export const stringifyHand = (text) => { const r = stringToTilesDetailed(text); return r.error === 0 ? { ok: true, hand: handToString(r.hand) } : { ok: false, error: r.error }; };
export const calculateShanten = (text) => {
  const r = stringToTilesDetailed(text); if (r.error !== 0) return { ok: false, error: r.error };
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
export const calculateFan = (text, options = {}) => {
  const r = stringToTilesDetailed(text);
  if (r.error !== 0) return { ok: false, error: r.error };
  return calculateFanTable(r.hand.standing_tiles, options);
};
