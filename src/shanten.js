const ORPHANS = [0,8,9,17,18,26,27,28,29,30,31,32,33];

export function tileIndex(t) {
  const suits = { m: 0, s: 1, p: 2 };
  const honors = { E: 27, S: 28, W: 29, N: 30, C: 31, F: 32, P: 33 };
  if (t.length === 2) return suits[t[1]] * 9 + Number(t[0]) - 1;
  return honors[t];
}

export function countsFromTiles(tiles) {
  const c = Array(34).fill(0);
  for (const t of tiles) c[tileIndex(t)]++;
  return c;
}

function canMeld(c, start = 0) {
  let i = start;
  while (i < 34 && c[i] === 0) i++;
  if (i >= 34) return true;
  if (c[i] >= 3) { c[i] -= 3; if (canMeld(c, i)) return c[i] += 3, true; c[i] += 3; }
  if (i < 27 && i % 9 <= 6 && c[i+1] && c[i+2]) { c[i]--; c[i+1]--; c[i+2]--; if (canMeld(c, i)) return c[i]++, c[i+1]++, c[i+2]++, true; c[i]++; c[i+1]++; c[i+2]++; }
  return false;
}

export function isRegularWin(tiles) {
  if ((tiles.length - 2) % 3 !== 0) return false;
  const c = countsFromTiles(tiles);
  for (let i = 0; i < 34; i++) if (c[i] >= 2) { c[i] -= 2; const ok = canMeld(c); c[i] += 2; if (ok) return true; }
  return false;
}

export function regularShanten(tiles) {
  const c = countsFromTiles(tiles); let best = 8;
  const dfs = (idx, m, p, t) => {
    while (idx < 34 && c[idx] === 0) idx++;
    best = Math.min(best, 8 - m * 2 - t - p);
    if (idx >= 34) return;
    if (m < 4 && c[idx] >= 3) { c[idx] -= 3; dfs(idx, m + 1, p, t); c[idx] += 3; }
    if (!p && c[idx] >= 2) { c[idx] -= 2; dfs(idx, m, 1, t); c[idx] += 2; }
    if (t < 4 - m && c[idx] >= 2) { c[idx] -= 2; dfs(idx, m, p, t + 1); c[idx] += 2; }
    if (idx < 27 && idx % 9 <= 6 && c[idx + 1] && c[idx + 2]) { c[idx]--; c[idx + 1]--; c[idx + 2]--; dfs(idx, m + 1, p, t); c[idx]++; c[idx + 1]++; c[idx + 2]++; }
    if (idx < 27 && idx % 9 <= 7 && c[idx + 1] && t < 4 - m) { c[idx]--; c[idx + 1]--; dfs(idx, m, p, t + 1); c[idx]++; c[idx + 1]++; }
    if (idx < 27 && idx % 9 <= 6 && c[idx + 2] && t < 4 - m) { c[idx]--; c[idx + 2]--; dfs(idx, m, p, t + 1); c[idx]++; c[idx + 2]++; }
    c[idx]--; dfs(idx, m, p, t); c[idx]++;
  };
  dfs(0,0,0,0);
  return best;
}

export function sevenPairsShanten(tiles) { const c = countsFromTiles(tiles); let p = 0, u = 0; for (const n of c) { if (n >= 2) p++; if (n > 0) u++; } return 6 - p + Math.max(0, 7 - u); }
export function thirteenOrphansShanten(tiles) { const c = countsFromTiles(tiles); let u = 0, pair = 0; for (const i of ORPHANS) { if (c[i]) u++; if (c[i] >= 2) pair = 1; } return 13 - u - pair; }

function indexToTile(i) {
  if (i < 9) return `${i + 1}m`;
  if (i < 18) return `${i - 8}s`;
  if (i < 27) return `${i - 17}p`;
  return ['E','S','W','N','C','F','P'][i - 27];
}

export function usefulTilesFor(tiles, shantenFn) {
  const base = shantenFn(tiles); const c = countsFromTiles(tiles); const useful = [];
  for (let i = 0; i < 34; i++) {
    if (c[i] >= 4) continue;
    const t = indexToTile(i);
    const next = shantenFn([...tiles, t]);
    if (next < base) useful.push(t);
  }
  return useful;
}
