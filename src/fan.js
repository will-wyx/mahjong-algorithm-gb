import { countsFromTiles, findDecompositions, tileIndex } from './shanten.js';

export const FAN_VALUE = {
  BIG_FOUR_WINDS: 88, BIG_THREE_DRAGONS: 88, ALL_GREEN: 88, NINE_GATES: 88, FOUR_KONGS: 88, SEVEN_SHIFTED_PAIRS: 88, THIRTEEN_ORPHANS: 88,
  ALL_TERMINALS: 64, LITTLE_FOUR_WINDS: 64, LITTLE_THREE_DRAGONS: 64, ALL_HONORS: 64, FOUR_CONCEALED_PUNGS: 64, PURE_TERMINAL_CHOWS: 64,
  QUADRUPLE_CHOW: 48, FOUR_PURE_SHIFTED_PUNGS: 48,
  FOUR_PURE_SHIFTED_CHOWS: 32, THREE_KONGS: 32, ALL_TERMINALS_AND_HONORS: 32,
  SEVEN_PAIRS: 24, GREATER_HONORS_AND_KNITTED_TILES: 24, ALL_EVEN_PUNGS: 24, FULL_FLUSH: 24, PURE_TRIPLE_CHOW: 24, PURE_SHIFTED_PUNGS: 24, UPPER_TILES: 24, MIDDLE_TILES: 24, LOWER_TILES: 24,
  PURE_STRAIGHT: 16, THREE_SUITED_TERMINAL_CHOWS: 16, PURE_SHIFTED_CHOWS: 16, ALL_FIVE: 16, TRIPLE_PUNG: 16, THREE_CONCEALED_PUNGS: 16,
  LESSER_HONORS_AND_KNITTED_TILES: 12, KNITTED_STRAIGHT: 12, UPPER_FOUR: 12, LOWER_FOUR: 12, BIG_THREE_WINDS: 12,
  MIXED_STRAIGHT: 8, REVERSIBLE_TILES: 8, MIXED_TRIPLE_CHOW: 8, MIXED_SHIFTED_PUNGS: 8, CHICKEN_HAND: 8, LAST_TILE_DRAW: 8, LAST_TILE_CLAIM: 8, OUT_WITH_REPLACEMENT_TILE: 8, ROBBING_THE_KONG: 8,
  ALL_PUNGS: 6, HALF_FLUSH: 6, MIXED_SHIFTED_CHOWS: 6, ALL_TYPES: 6, MELDED_HAND: 6, TWO_CONCEALED_KONGS: 6, TWO_DRAGONS_PUNGS: 6,
  OUTSIDE_HAND: 4, FULLY_CONCEALED_HAND: 4, TWO_MELDED_KONGS: 4, LAST_TILE: 4,
  DRAGON_PUNG: 2, PREVALENT_WIND: 2, SEAT_WIND: 2, CONCEALED_HAND: 2, ALL_CHOWS: 2, TILE_HOG: 2, DOUBLE_PUNG: 2, TWO_CONCEALED_PUNGS: 2, CONCEALED_KONG: 2, ALL_SIMPLES: 2,
  PURE_DOUBLE_CHOW: 1, MIXED_DOUBLE_CHOW: 1, SHORT_STRAIGHT: 1, TWO_TERMINAL_CHOWS: 1, PUNG_OF_TERMINALS_OR_HONORS: 1, MELDED_KONG: 1, ONE_VOIDED_SUIT: 1, NO_HONORS: 1, EDGE_WAIT: 1, CLOSED_WAIT: 1, SINGLE_WAIT: 1, SELF_DRAWN: 1, FLOWER_TILES: 1,
  CONCEALED_KONG_AND_MELDED_KONG: 5
};

function tile_get_suit(t) { return (t >> 4) & 0xF; }
function tile_get_rank(t) { return t & 0xF; }
function make_tile(suit, rank) { return (suit << 4) | rank; }

function is_numbered_suit_quick(t) { return !(t & 0xC0); }
function is_terminal(t) { return (t & 0xC7) === 1; }
function is_honor(t) { return t > 0x40 && t < 0x48; }
function is_terminal_or_honor(t) { return is_terminal(t) || is_honor(t); }
function is_winds(t) { return t > 0x40 && t < 0x45; }
function is_dragons(t) { return t > 0x44 && t < 0x48; }
function is_green(t) { return [0x22, 0x23, 0x24, 0x26, 0x28, 0x46].includes(t); }
function is_reversible(t) { return [0x22, 0x24, 0x25, 0x26, 0x28, 0x29, 0x31, 0x32, 0x33, 0x34, 0x35, 0x38, 0x39, 0x47].includes(t); }

const TILE_MAP = {
  '1m': 0x11, '2m': 0x12, '3m': 0x13, '4m': 0x14, '5m': 0x15, '6m': 0x16, '7m': 0x17, '8m': 0x18, '9m': 0x19,
  '1s': 0x21, '2s': 0x22, '3s': 0x23, '4s': 0x24, '5s': 0x25, '6s': 0x26, '7s': 0x27, '8s': 0x28, '9s': 0x29,
  '1p': 0x31, '2p': 0x32, '3p': 0x33, '4p': 0x34, '5p': 0x35, '6p': 0x36, '7p': 0x37, '8p': 0x38, '9p': 0x39,
  'E': 0x41, 'S': 0x42, 'W': 0x43, 'N': 0x44, 'C': 0x45, 'F': 0x46, 'P': 0x47
};

function toHexTile(t) { return TILE_MAP[t]; }

const STANDARD_THIRTEEN_ORPHANS = [0x11, 0x19, 0x21, 0x29, 0x31, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47];
const STANDARD_KNITTED_STRAIGHT = [
  [0x11, 0x14, 0x17, 0x22, 0x25, 0x28, 0x33, 0x36, 0x39],
  [0x11, 0x14, 0x17, 0x23, 0x26, 0x29, 0x32, 0x35, 0x38],
  [0x12, 0x15, 0x18, 0x21, 0x24, 0x27, 0x33, 0x36, 0x39],
  [0x12, 0x15, 0x18, 0x23, 0x26, 0x29, 0x31, 0x34, 0x37],
  [0x13, 0x16, 0x19, 0x21, 0x24, 0x27, 0x32, 0x35, 0x38],
  [0x13, 0x16, 0x19, 0x22, 0x25, 0x28, 0x31, 0x34, 0x37]
];

function is_four_shifted_1(r0, r1, r2, r3) { return r0 + 1 === r1 && r1 + 1 === r2 && r2 + 1 === r3; }
function is_four_shifted_2(r0, r1, r2, r3) { return r0 + 2 === r1 && r1 + 2 === r2 && r2 + 2 === r3; }
function is_shifted_1(r0, r1, r2) { return r0 + 1 === r1 && r1 + 1 === r2; }
function is_shifted_2(r0, r1, r2) { return r0 + 2 === r1 && r1 + 2 === r2; }
function is_shifted_1_unordered(r0, r1, r2) {
  const [a, b, c] = [r0, r1, r2].sort((x, y) => x - y);
  return a + 1 === b && b + 1 === c;
}
function is_mixed(s0, s1, s2) { return s0 !== s1 && s0 !== s2 && s1 !== s2; }

function get_4_chows_fan(t0, t1, t2, t3) {
  const r = [t0, t1, t2, t3].map(tile_get_rank).sort((a, b) => a - b);
  if (is_four_shifted_2(r[0], r[1], r[2], r[3])) return 'FOUR_PURE_SHIFTED_CHOWS';
  if (is_four_shifted_1(r[0], r[1], r[2], r[3])) return 'FOUR_PURE_SHIFTED_CHOWS';
  if (t0 === t1 && t1 === t2 && t2 === t3) return 'QUADRUPLE_CHOW';
  return null;
}

function get_3_chows_fan(t0, t1, t2) {
  const s = [t0, t1, t2].map(tile_get_suit);
  const r = [t0, t1, t2].map(tile_get_rank);
  if (is_mixed(s[0], s[1], s[2])) {
    if (is_shifted_1_unordered(r[0], r[1], r[2])) return 'MIXED_SHIFTED_CHOWS';
    if (r[0] === r[1] && r[1] === r[2]) return 'MIXED_TRIPLE_CHOW';
    const sortedR = [...r].sort((a, b) => a - b);
    if (sortedR[0] === 2 && sortedR[1] === 5 && sortedR[2] === 8) return 'MIXED_STRAIGHT';
  } else if (s[0] === s[1] && s[1] === s[2]) {
    const sortedT = [t0, t1, t2].sort((a, b) => a - b);
    if (sortedT[0] + 3 === sortedT[1] && sortedT[1] + 3 === sortedT[2]) return 'PURE_STRAIGHT';
    const sortedR = [...r].sort((a, b) => a - b);
    if (is_shifted_2(sortedR[0], sortedR[1], sortedR[2])) return 'PURE_SHIFTED_CHOWS';
    if (is_shifted_1(sortedR[0], sortedR[1], sortedR[2])) return 'PURE_SHIFTED_CHOWS';
    if (r[0] === r[1] && r[1] === r[2]) return 'PURE_TRIPLE_CHOW';
  }
  return null;
}

function get_2_chows_fan_unordered(t0, t1) {
  if (tile_get_suit(t0) !== tile_get_suit(t1)) {
    if (tile_get_rank(t0) === tile_get_rank(t1)) return 'MIXED_DOUBLE_CHOW';
  } else {
    const r = [tile_get_rank(t0), tile_get_rank(t1)].sort((a, b) => a - b);
    if (r[0] + 3 === r[1]) return 'SHORT_STRAIGHT';
    if (r[0] === 2 && r[1] === 8) return 'TWO_TERMINAL_CHOWS';
    if (r[0] === r[1]) return 'PURE_DOUBLE_CHOW';
  }
  return null;
}

function get_4_pungs_fan(t0, t1, t2, t3) {
  const r = [t0, t1, t2, t3].sort((a, b) => a - b);
  if (is_numbered_suit_quick(r[0]) && r[0] + 1 === r[1] && r[1] + 1 === r[2] && r[2] + 1 === r[3]) return 'FOUR_PURE_SHIFTED_PUNGS';
  if (r[0] === 0x41 && r[1] === 0x42 && r[2] === 0x43 && r[3] === 0x44) return 'BIG_FOUR_WINDS';
  return null;
}

function get_3_pungs_fan(t0, t1, t2) {
  const r = [t0, t1, t2].sort((a, b) => a - b);
  if (is_numbered_suit_quick(r[0]) && is_numbered_suit_quick(r[1]) && is_numbered_suit_quick(r[2])) {
    const s = r.map(tile_get_suit);
    const ranks = r.map(tile_get_rank);
    if (is_mixed(s[0], s[1], s[2])) {
      if (is_shifted_1_unordered(ranks[0], ranks[1], ranks[2])) return 'MIXED_SHIFTED_PUNGS';
      if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) return 'TRIPLE_PUNG';
    } else if (s[0] === s[1] && s[1] === s[2]) {
      if (ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2]) return 'PURE_SHIFTED_PUNGS';
    }
  } else {
    if (r[0] === 0x41 && r[1] === 0x42 && (r[2] === 0x43 || r[2] === 0x44)) return 'BIG_THREE_WINDS';
    if (r[0] === 0x41 && r[1] === 0x43 && r[2] === 0x44) return 'BIG_THREE_WINDS';
    if (r[0] === 0x42 && r[1] === 0x43 && r[2] === 0x44) return 'BIG_THREE_WINDS';
    if (r[0] === 0x45 && r[1] === 0x46 && r[2] === 0x47) return 'BIG_THREE_DRAGONS';
  }
  return null;
}

function get_2_pungs_fan_unordered(t0, t1) {
  if (is_numbered_suit_quick(t0) && is_numbered_suit_quick(t1)) {
    if (tile_get_rank(t0) === tile_get_rank(t1)) return 'DOUBLE_PUNG';
  } else {
    if (is_dragons(t0) && is_dragons(t1)) return 'TWO_DRAGONS_PUNGS';
  }
  return null;
}

function get_1_pung_fan(midTile) {
  if (is_dragons(midTile)) return 'DRAGON_PUNG';
  if (is_terminal(midTile) || is_winds(midTile)) return 'PUNG_OF_TERMINALS_OR_HONORS';
  return null;
}

function exclusionary_rule(allFans, maxCnt, fanTable) {
  const table = { PURE_DOUBLE_CHOW: 0, MIXED_DOUBLE_CHOW: 0, SHORT_STRAIGHT: 0, TWO_TERMINAL_CHOWS: 0 };
  let cnt = 0;
  for (const f of allFans) if (f && table[f] !== undefined) { cnt++; table[f]++; }
  let limit = 1;
  while (cnt > maxCnt && limit >= 0) {
    for (const key of ['TWO_TERMINAL_CHOWS', 'SHORT_STRAIGHT', 'MIXED_DOUBLE_CHOW', 'PURE_DOUBLE_CHOW']) {
      while (table[key] > limit && cnt > maxCnt) { table[key]--; cnt--; }
    }
    limit--;
  }
  for (const [k, v] of Object.entries(table)) if (v > 0) fanTable[k] = (fanTable[k] || 0) + v;
}

function calculate_3_of_4_chows(t0, t1, t2, t_extra, fanTable) {
  const fan = get_3_chows_fan(t0, t1, t2);
  if (fan) {
    fanTable[fan] = 1;
    const f1 = get_2_chows_fan_unordered(t0, t_extra);
    const f2 = get_2_chows_fan_unordered(t1, t_extra);
    const f3 = get_2_chows_fan_unordered(t2, t_extra);
    const extra = [f1, f2, f3].find(f => f === 'PURE_DOUBLE_CHOW') || [f1, f2, f3].find(f => f === 'MIXED_DOUBLE_CHOW') || [f1, f2, f3].find(f => f === 'SHORT_STRAIGHT') || [f1, f2, f3].find(f => f === 'TWO_TERMINAL_CHOWS');
    if (extra) fanTable[extra] = (fanTable[extra] || 0) + 1;
    return true;
  }
  return false;
}

function calculate_4_chows(midTiles, fanTable) {
  const fan = get_4_chows_fan(midTiles[0], midTiles[1], midTiles[2], midTiles[3]);
  if (fan) { fanTable[fan] = 1; return; }
  if (calculate_3_of_4_chows(midTiles[0], midTiles[1], midTiles[2], midTiles[3], fanTable) ||
      calculate_3_of_4_chows(midTiles[0], midTiles[1], midTiles[3], midTiles[2], fanTable) ||
      calculate_3_of_4_chows(midTiles[0], midTiles[2], midTiles[3], midTiles[1], fanTable) ||
      calculate_3_of_4_chows(midTiles[1], midTiles[2], midTiles[3], midTiles[0], fanTable)) return;
  const all = [];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) all.push(get_2_chows_fan_unordered(midTiles[i], midTiles[j]));
  let maxCnt = 3;
  if (!all[0] && !all[1] && !all[2]) maxCnt--;
  if (!all[0] && !all[3] && !all[4]) maxCnt--;
  if (!all[1] && !all[3] && !all[5]) maxCnt--;
  if (!all[2] && !all[4] && !all[5]) maxCnt--;
  if (maxCnt > 0) exclusionary_rule(all, maxCnt, fanTable);
}

function calculate_kongs(concPung, meldKong, concKong, fanTable) {
  const total = meldKong + concKong;
  if (total === 0) {
    if (concPung === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concPung === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    else if (concPung === 4) fanTable.FOUR_CONCEALED_PUNGS = 1;
  } else if (total === 1) {
    if (meldKong === 1) {
      fanTable.MELDED_KONG = 1;
      if (concPung === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concPung === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    } else {
      fanTable.CONCEALED_KONG = 1;
      if (concPung === 1) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concPung === 2) fanTable.THREE_CONCEALED_PUNGS = 1;
      else if (concPung === 3) fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 2) {
    if (concKong === 0) {
      fanTable.TWO_MELDED_KONGS = 1;
      if (concPung === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    } else if (concKong === 1) {
      fanTable.CONCEALED_KONG_AND_MELDED_KONG = 1;
      if (concPung === 1) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concPung === 2) fanTable.THREE_CONCEALED_PUNGS = 1;
    } else {
      fanTable.TWO_CONCEALED_KONGS = 1;
      if (concPung === 1) fanTable.THREE_CONCEALED_PUNGS = 1;
      else if (concPung === 2) fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 3) {
    fanTable.THREE_KONGS = 1;
    if (concKong === 1 && concPung > 0) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concKong === 2) {
      if (concPung === 0) fanTable.TWO_CONCEALED_PUNGS = 1; else fanTable.THREE_CONCEALED_PUNGS = 1;
    } else if (concKong === 3) {
      if (concPung === 0) fanTable.THREE_CONCEALED_PUNGS = 1; else fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 4) {
    fanTable.FOUR_KONGS = 1;
    if (concPung === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concPung === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    else if (concPung === 4) fanTable.FOUR_CONCEALED_PUNGS = 1;
  }
}

function calculate_4_pungs(midTiles, fanTable) {
  const fan = get_4_pungs_fan(midTiles[0], midTiles[1], midTiles[2], midTiles[3]);
  if (fan) { fanTable[fan] = 1; return; }
  let has3 = false, free = -1;
  for (let i = 0; i < 4; i++) {
    const others = midTiles.filter((_, idx) => idx !== i);
    const f = get_3_pungs_fan(others[0], others[1], others[2]);
    if (f) { fanTable[f] = 1; free = i; has3 = true; break; }
  }
  if (has3) {
    for (let i = 0; i < 4; i++) if (i !== free) {
      const f = get_2_pungs_fan_unordered(midTiles[i], midTiles[free]);
      if (f) { fanTable[f] = (fanTable[f] || 0) + 1; break; }
    }
    return;
  }
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const f = get_2_pungs_fan_unordered(midTiles[i], midTiles[j]);
    if (f) fanTable[f] = (fanTable[f] || 0) + 1;
  }
}

function calculate_3_chows(midTiles, fanTable) {
  const fan = get_3_chows_fan(midTiles[0], midTiles[1], midTiles[2]);
  if (fan) { fanTable[fan] = 1; return; }
  const all = [
    get_2_chows_fan_unordered(midTiles[0], midTiles[1]),
    get_2_chows_fan_unordered(midTiles[0], midTiles[2]),
    get_2_chows_fan_unordered(midTiles[1], midTiles[2])
  ];
  exclusionary_rule(all, 2, fanTable);
}

function calculate_3_pungs(midTiles, fanTable) {
  const fan = get_3_pungs_fan(midTiles[0], midTiles[1], midTiles[2]);
  if (fan) { fanTable[fan] = 1; return; }
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    const f = get_2_pungs_fan_unordered(midTiles[i], midTiles[j]);
    if (f) fanTable[f] = (fanTable[f] || 0) + 1;
  }
}

function calculate_2_chows_unordered(midTiles, fanTable) {
  const fan = get_2_chows_fan_unordered(midTiles[0], midTiles[1]);
  if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
}

function calculate_2_pungs_unordered(midTiles, fanTable) {
  const fan = get_2_pungs_fan_unordered(midTiles[0], midTiles[1]);
  if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
}

function adjust_by_win_flag(winFlag, fanTable) {
  if (winFlag & 2) fanTable.LAST_TILE = 1;
  if (winFlag & 1) {
    fanTable.SELF_DRAWN = 1;
    if (winFlag & 8) { fanTable.LAST_TILE_DRAW = 1; delete fanTable.SELF_DRAWN; }
    if (winFlag & 4) { fanTable.OUT_WITH_REPLACEMENT_TILE = 1; delete fanTable.SELF_DRAWN; }
  } else {
    if (winFlag & 8) fanTable.LAST_TILE_CLAIM = 1;
    if (winFlag & 4) { fanTable.ROBBING_THE_KONG = 1; delete fanTable.LAST_TILE; }
  }
}

function adjust_by_win_flag_4_special_form(seatWind, winFlag, fanTable) {
  adjust_by_win_flag(winFlag, fanTable);
}

function adjust_by_suits(tiles, fanTable) {
  let suitFlag = 0;
  for (const t of tiles) suitFlag |= (1 << tile_get_suit(t));
  if (!(suitFlag & 0xF1)) fanTable.NO_HONORS = 1;
  let voided = 0;
  if (!(suitFlag & 0xE3)) voided++;
  if (!(suitFlag & 0xE5)) voided++;
  if (!(suitFlag & 0xE9)) voided++;
  if (voided === 2) {
    if (!fanTable.NO_HONORS) fanTable.HALF_FLUSH = 1;
    else { fanTable.FULL_FLUSH = 1; delete fanTable.NO_HONORS; }
  } else if (voided === 1) fanTable.ONE_VOIDED_SUIT = 1;
  if (suitFlag === 0x1E && tiles.some(is_winds) && tiles.some(is_dragons)) fanTable.ALL_TYPES = 1;
}

function adjust_by_rank_range(tiles, fanTable) {
  if (tiles.some(t => !is_numbered_suit_quick(t))) return;
  let rankFlag = 0;
  for (const t of tiles) rankFlag |= (1 << tile_get_rank(t));
  if (!(rankFlag & 0xFFE1)) fanTable[rankFlag & 0x0010 ? 'LOWER_FOUR' : 'LOWER_TILES'] = 1;
  else if (!(rankFlag & 0xFC3F)) fanTable[rankFlag & 0x0040 ? 'UPPER_FOUR' : 'UPPER_TILES'] = 1;
  else if (!(rankFlag & 0xFF8F)) fanTable.MIDDLE_TILES = 1;
}

function adjust_by_tiles_traits(tiles, fanTable) {
  if (tiles.every(t => !is_terminal_or_honor(t))) fanTable.ALL_SIMPLES = 1;
  if (tiles.every(is_reversible)) fanTable.REVERSIBLE_TILES = 1;
  if (tiles.every(is_green)) fanTable.ALL_GREEN = 1;
  if (fanTable.ALL_SIMPLES) return;
  if (tiles.every(is_honor)) { fanTable.ALL_HONORS = 1; return; }
  if (tiles.every(is_terminal)) { fanTable.ALL_TERMINALS = 1; return; }
  if (tiles.every(is_terminal_or_honor)) fanTable.ALL_TERMINALS_AND_HONORS = 1;
}

function adjust_by_tiles_hog(counts, kongCnt, fanTable) {
  let hog = 0;
  for (const n of counts) if (n === 4) hog++;
  if (hog > kongCnt) fanTable.TILE_HOG = hog - kongCnt;
}

function final_adjust(fanTable) {
  if (fanTable.BIG_FOUR_WINDS) { delete fanTable.ALL_PUNGS; delete fanTable.PUNG_OF_TERMINALS_OR_HONORS; }
  if (fanTable.BIG_THREE_DRAGONS) delete fanTable.DRAGON_PUNG;
  if (fanTable.ALL_GREEN) { delete fanTable.HALF_FLUSH; delete fanTable.ONE_VOIDED_SUIT; }
  if (fanTable.FOUR_KONGS) delete fanTable.SINGLE_WAIT;
  if (fanTable.ALL_TERMINALS) {
    delete fanTable.ALL_PUNGS; delete fanTable.OUTSIDE_HAND; delete fanTable.PUNG_OF_TERMINALS_OR_HONORS;
    delete fanTable.NO_HONORS; delete fanTable.DOUBLE_PUNG;
  }
  if (fanTable.LITTLE_FOUR_WINDS) delete fanTable.PUNG_OF_TERMINALS_OR_HONORS;
  if (fanTable.LITTLE_THREE_DRAGONS) delete fanTable.DRAGON_PUNG;
  if (fanTable.ALL_HONORS) {
    delete fanTable.ALL_PUNGS; delete fanTable.OUTSIDE_HAND; delete fanTable.PUNG_OF_TERMINALS_OR_HONORS; delete fanTable.ONE_VOIDED_SUIT;
  }
  if (fanTable.FOUR_CONCEALED_PUNGS) {
    delete fanTable.ALL_PUNGS; delete fanTable.CONCEALED_HAND;
    if (fanTable.FULLY_CONCEALED_HAND) { delete fanTable.FULLY_CONCEALED_HAND; fanTable.SELF_DRAWN = 1; }
  }
  if (fanTable.PURE_TERMINAL_CHOWS) { delete fanTable.FULL_FLUSH; delete fanTable.ALL_CHOWS; delete fanTable.NO_HONORS; }
  if (fanTable.FOUR_PURE_SHIFTED_PUNGS) delete fanTable.ALL_PUNGS;
  if (fanTable.ALL_TERMINALS_AND_HONORS) { delete fanTable.ALL_PUNGS; delete fanTable.OUTSIDE_HAND; delete fanTable.PUNG_OF_TERMINALS_OR_HONORS; }
  if (fanTable.ALL_EVEN_PUNGS) { delete fanTable.ALL_PUNGS; delete fanTable.ALL_SIMPLES; delete fanTable.NO_HONORS; }
  if (fanTable.UPPER_TILES) delete fanTable.NO_HONORS;
  if (fanTable.MIDDLE_TILES) { delete fanTable.ALL_SIMPLES; delete fanTable.NO_HONORS; }
  if (fanTable.LOWER_TILES) delete fanTable.NO_HONORS;
  if (fanTable.THREE_SUITED_TERMINAL_CHOWS) { delete fanTable.ALL_CHOWS; delete fanTable.NO_HONORS; }
  if (fanTable.ALL_FIVE) { delete fanTable.ALL_SIMPLES; delete fanTable.NO_HONORS; }
  if (fanTable.UPPER_FOUR) delete fanTable.NO_HONORS;
  if (fanTable.LOWER_FOUR) delete fanTable.NO_HONORS;
  if (fanTable.BIG_THREE_WINDS) {
    if (!fanTable.ALL_HONORS && !fanTable.ALL_TERMINALS_AND_HONORS) {
      fanTable.PUNG_OF_TERMINALS_OR_HONORS = (fanTable.PUNG_OF_TERMINALS_OR_HONORS || 0) - 3;
      if (fanTable.PUNG_OF_TERMINALS_OR_HONORS <= 0) delete fanTable.PUNG_OF_TERMINALS_OR_HONORS;
    }
  }
  if (fanTable.REVERSIBLE_TILES) delete fanTable.ONE_VOIDED_SUIT;
  if (fanTable.LAST_TILE_DRAW) delete fanTable.SELF_DRAWN;
  if (fanTable.OUT_WITH_REPLACEMENT_TILE) delete fanTable.SELF_DRAWN;
  if (fanTable.MELDED_HAND) delete fanTable.SINGLE_WAIT;
  if (fanTable.TWO_DRAGONS_PUNGS) delete fanTable.DRAGON_PUNG;
  if (fanTable.FULLY_CONCEALED_HAND) delete fanTable.SELF_DRAWN;
  if (fanTable.ALL_CHOWS) delete fanTable.NO_HONORS;
  if (fanTable.ALL_SIMPLES) delete fanTable.NO_HONORS;
}

function is_seven_pairs(counts) { 
  let pairs = 0;
  for (let i = 0; i < 0x59; i++) if (counts[i]) {
    if (counts[i] % 2 !== 0) return false;
    pairs += counts[i] / 2;
  }
  return pairs === 7;
}

function is_seven_shifted_pairs(counts, suit) {
  if (suit === 4) return false;
  const t3 = make_tile(suit, 3);
  if (counts[t3] === 2 && counts[t3+1] === 2 && counts[t3+2] === 2 && counts[t3+3] === 2 && counts[t3+4] === 2) {
    if (counts[t3-1] === 2) return counts[t3-2] === 2 || counts[t3+5] === 2;
    return counts[t3+5] === 2 && counts[t3+6] === 2;
  }
  return false;
}

function is_thirteen_orphans(uniqueTiles) {
  if (uniqueTiles.length !== 13) return false;
  const sorted = [...uniqueTiles].sort();
  const std = [...STANDARD_THIRTEEN_ORPHANS].sort();
  return sorted.every((t, i) => t === std[i]);
}

function calculate_honors_and_knitted_tiles(uniqueTiles, fanTable) {
  if (uniqueTiles.length !== 14) return false;
  const numbered = uniqueTiles.filter(t => !is_honor(t)).sort();
  if (numbered.length > 9 || numbered.length < 7) return false;
  if (!STANDARD_KNITTED_STRAIGHT.some(seq => seq.every(t => uniqueTiles.includes(t)))) return false;
  const honors = uniqueTiles.filter(is_honor).sort();
  if (numbered.length === 7 && honors.length === 7) { fanTable.GREATER_HONORS_AND_KNITTED_TILES = 1; return true; }
  const stdHonors = STANDARD_THIRTEEN_ORPHANS.slice(6);
  if (honors.every(h => stdHonors.includes(h))) {
    fanTable.LESSER_HONORS_AND_KNITTED_TILES = 1;
    if (numbered.length === 9) fanTable.KNITTED_STRAIGHT = 1;
    return true;
  }
  return false;
}

function calculate_special_form_fan(counts, hexAll, uniqueTiles, winTile, seatWind, winFlag, fanTable) {
  if (is_seven_pairs(counts)) {
    const s = tile_get_suit(winTile);
    if (is_seven_shifted_pairs(counts, s)) {
      fanTable.SEVEN_SHIFTED_PAIRS = 1;
      if (counts[make_tile(s, 1)] === 0 && counts[make_tile(s, 9)] === 0) fanTable.ALL_SIMPLES = 1;
      adjust_by_win_flag_4_special_form(seatWind, winFlag, fanTable);
    } else {
      fanTable.SEVEN_PAIRS = 1;
      adjust_by_suits(uniqueTiles, fanTable);
      adjust_by_tiles_traits(uniqueTiles, fanTable);
      adjust_by_rank_range(uniqueTiles, fanTable);
      adjust_by_tiles_hog(counts, 0, fanTable);
      adjust_by_win_flag_4_special_form(seatWind, winFlag, fanTable);
      final_adjust(fanTable);
    }
    return true;
  }
  if (calculate_honors_and_knitted_tiles(uniqueTiles, fanTable)) {
    adjust_by_win_flag_4_special_form(seatWind, winFlag, fanTable);
    return true;
  }
  if (is_thirteen_orphans(uniqueTiles)) {
    fanTable.THIRTEEN_ORPHANS = 1;
    adjust_by_win_flag_4_special_form(seatWind, winFlag, fanTable);
    return true;
  }
  return false;
}

function adjust_by_self_drawn(melds, selfDrawn, fanTable) {
  const meldedCnt = melds.filter(m => m.melded).length;
  if (meldedCnt === 0) fanTable[selfDrawn ? 'FULLY_CONCEALED_HAND' : 'CONCEALED_HAND'] = 1;
  else if (meldedCnt === 4) fanTable[selfDrawn ? 'SELF_DRAWN' : 'MELDED_HAND'] = 1;
  else if (selfDrawn) fanTable.SELF_DRAWN = 1;
}

function adjust_by_pair_tile(pairTile, chowCnt, fanTable) {
  if (chowCnt === 4 && is_numbered_suit_quick(pairTile)) fanTable.ALL_CHOWS = 1;
  if (fanTable.TWO_DRAGONS_PUNGS && is_dragons(pairTile)) { fanTable.LITTLE_THREE_DRAGONS = 1; delete fanTable.TWO_DRAGONS_PUNGS; }
  if (fanTable.BIG_THREE_WINDS && is_winds(pairTile)) { fanTable.LITTLE_FOUR_WINDS = 1; delete fanTable.BIG_THREE_WINDS; }
}

function adjust_by_packs_traits(melds, pairTile, fanTable) {
  let terminal = 0, honor = 0, five = 0, even = 0;
  const all = [...melds, { type: 'PAIR', tile: pairTile }];
  for (const m of all) {
    if (is_numbered_suit_quick(m.tile)) {
      const r = tile_get_rank(m.tile);
      if (m.type === 'CHOW') {
        if (r === 2 || r === 8) terminal++;
        if (r >= 4 && r <= 6) five++;
      } else {
        if (r === 1 || r === 9) terminal++;
        if (r === 5) five++;
        if (r % 2 === 0) even++;
      }
    } else honor++;
  }
  if (terminal + honor === 5) fanTable.OUTSIDE_HAND = 1;
  else if (five === 5) fanTable.ALL_FIVE = 1;
  else if (even === 5) fanTable.ALL_EVEN_PUNGS = 1;
}

function is_unique_waiting(standingTiles, winTile) {
  return true; 
}

function calculate_regular_fan(melds, pairTile, uniqueTiles, hexAll, counts, kongInfo, options, fanTable) {
  const { winTile, winFlag, seatWind, prevalentWind } = options;
  const chows = melds.filter(m => m.type === 'CHOW').map(m => m.tile);
  const pungs = melds.filter(m => m.type === 'PUNG' || m.type === 'KONG').map(m => m.tile);
  const concealedPungs = melds.filter(m => (m.type === 'PUNG' || m.type === 'KONG') && !m.melded).length;
  
  if (pungs.length > 0) {
    calculate_kongs(concealedPungs, kongInfo.melded, kongInfo.concealed, fanTable);
    if (pungs.length === 4 && !fanTable.FOUR_KONGS && !fanTable.FOUR_CONCEALED_PUNGS) fanTable.ALL_PUNGS = 1;
    for (const p of pungs) {
      const fan = get_1_pung_fan(p);
      if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
    }
  }

  if (chows.length === 4) calculate_4_chows(chows.sort((a,b)=>a-b), fanTable);
  else if (chows.length === 3) calculate_3_chows(chows.sort((a,b)=>a-b), fanTable);
  else if (chows.length === 2) {
    calculate_2_chows_unordered(chows, fanTable);
    calculate_2_pungs_unordered(pungs, fanTable);
  } else if (chows.length === 1) calculate_3_pungs(pungs.sort((a,b)=>a-b), fanTable);
  else if (chows.length === 0 && pungs.length === 4) calculate_4_pungs(pungs.sort((a,b)=>a-b), fanTable);

  adjust_by_self_drawn(melds, options.selfDrawn, fanTable);
  adjust_by_pair_tile(pairTile, chows.length, fanTable);
  adjust_by_packs_traits(melds, pairTile, fanTable);
  adjust_by_suits(uniqueTiles, fanTable);
  adjust_by_tiles_traits(uniqueTiles, fanTable);
  adjust_by_rank_range(uniqueTiles, fanTable);
  if (!fanTable.QUADRUPLE_CHOW) adjust_by_tiles_hog(counts, kongInfo.melded + kongInfo.concealed, fanTable);

  if (is_unique_waiting(options.standingTiles, options.winTile)) {
    const concealedMelds = melds.filter(m => !m.melded);
    const hexWin = toHexTile(options.winTile);
    if (pairTile === hexWin) fanTable.SINGLE_WAIT = 1;
    else {
      for (const m of concealedMelds) {
        if (m.type === 'CHOW') {
          if (m.tile === hexWin) fanTable.CLOSED_WAIT = 1;
          else if (m.tile + 1 === hexWin || m.tile - 1 === hexWin) fanTable.EDGE_WAIT = 1;
        }
      }
    }
  }

  if (!fanTable.BIG_FOUR_WINDS) {
    for (const p of pungs) if (is_winds(p)) {
      if (p === 0x41 + prevalentWind) fanTable.PREVALENT_WIND = (fanTable.PREVALENT_WIND || 0) + 1;
      if (p === 0x41 + seatWind) fanTable.SEAT_WIND = (fanTable.SEAT_WIND || 0) + 1;
    }
  }

  adjust_by_win_flag(winFlag, fanTable);
  final_adjust(fanTable);
  if (Object.keys(fanTable).length === 0) fanTable.CHICKEN_HAND = 1;
}

export function calculateFanTable(hand, options = {}) {
  const { selfDrawn = false, concealed = true, prevalentWind = 0, seatWind = 0, flowerCount = 0 } = options;
  const hexStanding = hand.standing_tiles.map(toHexTile);
  const hexAll = [...hexStanding, ...hand.fixed_packs.flatMap(p => p.tiles.map(toHexTile))];
  if (hexAll.length !== 14) return { ok: false, totalFan: -1, fanTable: {} };

  const uniqueTiles = Array.from(new Set(hexAll));
  const counts = Array(0x59).fill(0);
  for (const t of hexAll) counts[t]++;

  let winTile = hand.standing_tiles[hand.standing_tiles.length - 1];
  let winFlag = (selfDrawn ? 1 : 0);

  let bestFanTable = {};
  let maxFan = -1;

  if (hand.fixed_packs.length === 0) {
    const specialTable = {};
    if (calculate_special_form_fan(counts, hexAll, uniqueTiles, toHexTile(winTile), seatWind, winFlag, specialTable)) {
      bestFanTable = specialTable;
      maxFan = Object.entries(bestFanTable).reduce((s, [k, v]) => s + (FAN_VALUE[k] || 0) * v, 0);
    }
  }

  const decompositions = findDecompositions(hand.standing_tiles);
  for (const dec of decompositions) {
    const currentTable = {};
    const melds = dec.melds.map(m => ({ type: m.type, tile: toHexTile(m.tile), melded: false }));
    const kongInfo = { melded: 0, concealed: 0 };
    for (const p of hand.fixed_packs) {
      const type = p.tiles.length === 4 ? 'KONG' : (p.tiles[0] === p.tiles[1] ? 'PUNG' : 'CHOW');
      melds.push({ type, tile: toHexTile(p.tiles[1]), melded: true });
      if (type === 'KONG') kongInfo.melded++;
    }

    calculate_regular_fan(melds, toHexTile(dec.pair), uniqueTiles, hexAll, counts, kongInfo, { ...options, winTile, winFlag, standingTiles: hand.standing_tiles }, currentTable);
    const currentFan = Object.entries(currentTable).reduce((s, [k, v]) => s + (FAN_VALUE[k] || 0) * v, 0);
    if (currentFan > maxFan) {
      maxFan = currentFan;
      bestFanTable = currentTable;
    }
  }

  if (maxFan === -1) return { ok: false, totalFan: -3, fanTable: {} };

  bestFanTable.FLOWER_TILES = flowerCount;
  const totalFan = Object.entries(bestFanTable).reduce((s, [k, v]) => s + (FAN_VALUE[k] || 0) * v, 0);
  return { ok: true, totalFan, fanTable: bestFanTable };
}
