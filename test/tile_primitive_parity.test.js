import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function ensureCli() {
  if (existsSync('./test/tile_primitive_cli')) return;
  execSync('g++ -std=c++17 -O2 -I. test/tile_primitive_cli.cpp -o test/tile_primitive_cli', { stdio: 'inherit' });
}

function getTileSuit(tile) { return (tile >> 4) & 0xF; }
function getTileRank(tile) { return tile & 0xF; }
function isNumberedSuit(tile) { return !(tile & 0xC0); }
function isTerminal(tile) { return (tile & 0xC7) === 1; }
function isHonor(tile) { return tile > 0x40 && tile < 0x48; }
function isWind(tile) { return tile > 0x40 && tile < 0x45; }
function isTerminalOrHonor(tile) { return isTerminal(tile) || isHonor(tile); }

ensureCli();

const validTiles = [];
for (let t = 0x11; t <= 0x19; t++) validTiles.push(t);
for (let t = 0x21; t <= 0x29; t++) validTiles.push(t);
for (let t = 0x31; t <= 0x39; t++) validTiles.push(t);
for (let t = 0x41; t <= 0x47; t++) validTiles.push(t);

for (const tile of validTiles) {
  const cpp = execSync(`./test/tile_primitive_cli ${tile}`).toString().trim().split(',').map(Number);
  const js = [
    getTileSuit(tile),
    getTileRank(tile),
    isNumberedSuit(tile) ? 1 : 0,
    isTerminal(tile) ? 1 : 0,
    isHonor(tile) ? 1 : 0,
    isWind(tile) ? 1 : 0,
    isTerminalOrHonor(tile) ? 1 : 0
  ];
  if (cpp.join(',') !== js.join(',')) {
    throw new Error(`tile primitive mismatch at 0x${tile.toString(16)} js=${js} cpp=${cpp}`);
  }
}

console.log('tile primitive parity passed');
