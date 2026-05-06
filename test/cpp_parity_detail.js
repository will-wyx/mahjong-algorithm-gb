import { calculateFan } from '../src/index.js';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function ensureCli() {
  if (existsSync('./test/fan_cli')) return;
  execSync('g++ -std=c++17 -O2 -I. test/fan_cli.cpp fan_calculator.cpp stringify.cpp -o test/fan_cli', { stdio: 'inherit' });
}

ensureCli();



const cases = [
  ['147m258s3666789p6p', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['[666p]147m258s3779p6p', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }],
  ['3369m147s258pEEE3m', { selfDrawn: false, prevalentWind: 0, seatWind: 0 }]
];

for (const [hand, options] of cases) {
  const flag = options.selfDrawn ? 1 : 0;
  const out = execSync(`./test/fan_cli '${hand}' ${flag} ${options.prevalentWind} ${options.seatWind} 0 --detail`).toString().trim();
  const [cppTotal, cppDetail] = out.split('|');
  const js = calculateFan(hand, options);
  console.log('---');
  console.log(hand);
  console.log('JS total:', js.totalFan, 'fanTable:', js.fanTable);
  console.log('CPP total:', Number(cppTotal), 'fanTable(index:count):', cppDetail || '(none)');
}
