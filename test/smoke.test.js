import assert from 'node:assert/strict';
import { calculateFan, calculateShanten } from '../src/index.js';

assert.equal(calculateShanten('111m5m12p1569sSWP').ok, true);

const big3 = calculateFan('CCCFFFPPP123m11m', { selfDrawn: true, concealed: true });
assert.equal(big3.ok, true);
assert.equal(big3.fanTable.BIG_THREE_DRAGONS, 1);
assert.equal(big3.totalFan, 119);

const sevenPairs = calculateFan('1122m3344s5566pEE', { selfDrawn: true, concealed: true });
assert.equal(sevenPairs.fanTable.SEVEN_PAIRS, 1);

const orphans = calculateFan('19m19s19pESWNCFP1m', { selfDrawn: true, concealed: true });
assert.equal(orphans.fanTable.THIRTEEN_ORPHANS, 1);

console.log('smoke tests passed');
