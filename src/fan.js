import { countsFromTiles, isRegularWin } from './shanten.js';

export const FAN_VALUE = {
  BIG_THREE_DRAGONS: 88,
  THIRTEEN_ORPHANS: 88,
  SEVEN_PAIRS: 24,
  FULL_FLUSH: 24,
  HALF_FLUSH: 6,
  ALL_PUNGS: 6,
  ALL_CHOWS: 2,
  ALL_SIMPLES: 2,
  NO_HONORS: 1,
  DRAGON_PUNG: 2,
  SELF_DRAWN: 1,
  CONCEALED_HAND: 2,
  CHICKEN_HAND: 8
};

const DRAGONS = [31, 32, 33];

function hasPung(c, idx) { return c[idx] >= 3; }
function suitOf(i) { return i < 9 ? 0 : i < 18 ? 1 : i < 27 ? 2 : 3; }

function isThirteenOrphans(c) {
  const need = [0,8,9,17,18,26,27,28,29,30,31,32,33];
  let pair = false;
  for (const i of need) {
    if (c[i] === 0) return false;
    if (c[i] >= 2) pair = true;
  }
  for (let i = 0; i < 34; i++) if (!need.includes(i) && c[i] > 0) return false;
  return pair;
}

function isSevenPairs(c) {
  let pairs = 0;
  for (const n of c) {
    if (n === 2) pairs++;
    else if (n !== 0) return false;
  }
  return pairs === 7;
}

function detectFlush(c) {
  const suits = new Set();
  let hasHonor = false;
  for (let i = 0; i < 34; i++) if (c[i]) {
    const s = suitOf(i);
    if (s === 3) hasHonor = true;
    else suits.add(s);
  }
  if (suits.size === 1 && !hasHonor) return 'FULL_FLUSH';
  if (suits.size === 1 && hasHonor) return 'HALF_FLUSH';
  return null;
}

function isAllSimples(c) {
  const terminals = new Set([0,8,9,17,18,26]);
  for (let i = 0; i < 34; i++) if (c[i]) {
    if (i >= 27) return false;
    if (terminals.has(i) || terminals.has(i-9) || terminals.has(i-18)) return false;
  }
  return true;
}

export function calculateFanTable(tiles, options = {}) {
  const { selfDrawn = false, concealed = true } = options;
  const fanTable = {};
  const c = countsFromTiles(tiles);

  if (isThirteenOrphans(c)) fanTable.THIRTEEN_ORPHANS = 1;
  else if (isSevenPairs(c)) fanTable.SEVEN_PAIRS = 1;
  else if (!isRegularWin(tiles)) return { ok: false, totalFan: -3, fanTable };

  if (hasPung(c, 31) && hasPung(c, 32) && hasPung(c, 33)) {
    fanTable.BIG_THREE_DRAGONS = 1;
  } else {
    for (const d of DRAGONS) if (hasPung(c, d)) fanTable.DRAGON_PUNG = (fanTable.DRAGON_PUNG || 0) + 1;
  }

  const flush = detectFlush(c);
  if (flush) fanTable[flush] = 1;

  let triplets = 0;
  for (let i = 0; i < 34; i++) triplets += Math.floor(c[i] / 3);
  if (triplets >= 4 && !fanTable.BIG_THREE_DRAGONS) fanTable.ALL_PUNGS = 1;
  if (triplets === 0 && isRegularWin(tiles)) fanTable.ALL_CHOWS = 1;

  if (isAllSimples(c)) fanTable.ALL_SIMPLES = 1;
  if (tiles.every((t) => t.length === 2)) fanTable.NO_HONORS = 1;

  if (selfDrawn) fanTable.SELF_DRAWN = 1;
  if (concealed) fanTable.CONCEALED_HAND = 1;

  let totalFan = Object.entries(fanTable).reduce((s, [k, v]) => s + (FAN_VALUE[k] || 0) * v, 0);
  if (totalFan === 0) totalFan = FAN_VALUE.CHICKEN_HAND;
  return { ok: true, totalFan, fanTable };
}
