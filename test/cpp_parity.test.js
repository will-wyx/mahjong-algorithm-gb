import { calculateFan } from '../src/index.js';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function ensureCli() {
  if (existsSync('./test/fan_cli')) return;
  execSync('g++ -std=c++17 -O2 -I. test/fan_cli.cpp fan_calculator.cpp stringify.cpp -o test/fan_cli', { stdio: 'inherit' });
}

ensureCli();



const cases = [
  ['123m456s789p123p55m', { selfDrawn: true, wallLast: true, prevalentWind: 0, seatWind: 0 }],
  ['11112345678999p', { selfDrawn: true, prevalentWind: 0, seatWind: 0 }],
  ['4445677m777s777p7m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['2222444466688m3m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['123m456s789p123p55m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['1122334455667m7m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['19m19s19pESWNCFPN', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['[CCC][PPP]11m99pFFF1m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['147m258s3666789p6p', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['[666p]147m258s3779p6p', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['3369m147s258pEEE3m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
];

for (const [hand, options] of cases) {
  let flag = options.selfDrawn ? 1 : 0;
  if (options.lastTile) flag |= 2;
  if (options.kongInvolved) flag |= 4;
  if (options.wallLast) flag |= 8;
  if (options.initial) flag |= 16;
  const cppFan = Number(execSync(`./test/fan_cli '${hand}' ${flag} ${options.prevalentWind} ${options.seatWind}`).toString());
  const js = calculateFan(hand, options);
  if (!js.ok) throw new Error(`JS calculate failed: ${hand}`);
  if (js.totalFan !== cppFan) {
    throw new Error(`Fan mismatch for ${hand}: js=${js.totalFan}, cpp=${cppFan}`);
  }
}

console.log('cpp parity tests passed');
