import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { calculateFan } from '../src/index.js';

const text = readFileSync('unit_test.cpp', 'utf8');
const regex = /test_points\("([^"]+)",\s*([^,]+),\s*wind_t::(EAST|SOUTH|WEST|NORTH),\s*wind_t::(EAST|SOUTH|WEST|NORTH)\);/g;

const windMap = { EAST: 0, SOUTH: 1, WEST: 2, NORTH: 3 };
let m;
let total = 0;
let mismatch = 0;
const samples = [];
let nonWinOrParse = 0;
let parseError = 0;
const deltaBuckets = new Map();

while ((m = regex.exec(text)) !== null) {
  const hand = m[1];
  const flagExpr = m[2];
  const selfDrawn = /SELF_DRAWN/.test(flagExpr);
  const lastTile = /LAST_TILE/.test(flagExpr);
  const kongInvolved = /KONG_INVOLVED/.test(flagExpr);
  const wallLast = /WALL_LAST/.test(flagExpr);
  const initial = /INITIAL/.test(flagExpr);
  const prevalentWind = windMap[m[3]];
  const seatWind = windMap[m[4]];

  let flag = selfDrawn ? 1 : 0;
  if (lastTile) flag |= 2;
  if (kongInvolved) flag |= 4;
  if (wallLast) flag |= 8;
  if (initial) flag |= 16;

  const cpp = Number(execSync(`./test/fan_cli '${hand}' ${flag} ${prevalentWind} ${seatWind}`).toString());
  const js = calculateFan(hand, { selfDrawn, lastTile, kongInvolved, wallLast, initial, prevalentWind, seatWind });

  total++;
  if (!js.ok || js.totalFan !== cpp) {
    mismatch++;
    if (!js.ok) { nonWinOrParse++; if (typeof js.error === "number" && js.error !== -3) parseError++; }
    const delta = (js.ok ? js.totalFan : -999) - cpp;
    deltaBuckets.set(delta, (deltaBuckets.get(delta) || 0) + 1);
    if (samples.length < 20) samples.push({ hand, js: js.totalFan, cpp, flagExpr, prevalentWind, seatWind });
  }
}

console.log(`scan total=${total}, mismatch=${mismatch}, nonWinOrParse=${nonWinOrParse}, parseError=${parseError}`);
const topDeltas = [...deltaBuckets.entries()].sort((a,b)=>Math.abs(b[1]-a[1])).slice(0,10);
console.log('delta histogram (js-cpp):', topDeltas.map(([d,c])=>`${d}:${c}`).join(' '));
for (const s of samples) {
  console.log(`${s.hand} | js=${s.js} cpp=${s.cpp} | ${s.flagExpr} | pw=${s.prevalentWind} sw=${s.seatWind}`);
}
