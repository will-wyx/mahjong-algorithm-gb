/** 幺九牌（Terminal and Honor tiles）的索引列表 */
const ORPHANS = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

/**
 * 将牌字符串（如 '1m', 'E'）转换为 0-33 的索引。
 * @param {string} t - 牌字符串
 * @returns {number} 索引值
 */
export function tileIndex(t) {
  const suits = { m: 0, s: 1, p: 2 };
  const honors = { E: 27, S: 28, W: 29, N: 30, C: 31, F: 32, P: 33 };
  if (t.length === 2) return suits[t[1]] * 9 + Number(t[0]) - 1;
  return honors[t];
}

/**
 * 将牌数组转换为长度为 34 的计数数组。
 * @param {string[]} tiles - 牌数组
 * @returns {number[]} 计数数组
 */
export function countsFromTiles(tiles) {
  const c = Array(34).fill(0);
  for (const t of tiles) c[tileIndex(t)]++;
  return c;
}

/**
 * 递归获取手牌的所有可能面子分解（顺子、刻子）。
 * @param {number[]} c - 计数数组（会被修改，需注意还原）
 * @param {number} start - 开始扫描的索引
 * @returns {Array[]} 所有可能的分解方案数组
 */
function getDecompositions(c, start = 0) {
  let i = start;
  while (i < 34 && c[i] === 0) i++;
  if (i >= 34) return [[]];
  const results = [];

  // 尝试提取刻子
  if (c[i] >= 3) {
    c[i] -= 3;
    const sub = getDecompositions(c, i);
    for (const s of sub) results.push([{ type: 'PUNG', tile: indexToTile(i) }, ...s]);
    c[i] += 3;
  }

  // 尝试提取顺子（仅限数牌）
  if (i < 27 && i % 9 <= 6 && c[i + 1] && c[i + 2]) {
    c[i]--; c[i + 1]--; c[i + 2]--;
    const sub = getDecompositions(c, i);
    for (const s of sub) results.push([{ type: 'CHOW', tile: indexToTile(i + 1) }, ...s]);
    c[i]++; c[i + 1]++; c[i + 2]++;
  }
  return results;
}

/**
 * 找出立牌中所有可能的“雀头 + 面子”分解方案。
 * @param {string[]} tiles - 立牌数组
 * @returns {Object[]} 分解方案列表，每个对象包含 pair 和 melds
 */
export function findDecompositions(tiles) {
  const c = countsFromTiles(tiles);
  const all = [];
  for (let i = 0; i < 34; i++) {
    if (c[i] >= 2) {
      c[i] -= 2; // 尝试作为雀头
      const decs = getDecompositions(c);
      for (const d of decs) all.push({ pair: indexToTile(i), melds: d });
      c[i] += 2;
    }
  }
  return all;
}

/**
 * 判断是否为常规和牌型（4面子 + 1雀头）。
 * @param {string[]} tiles - 牌数组
 * @returns {boolean}
 */
export function isRegularWin(tiles) {
  if ((tiles.length - 2) % 3 !== 0) return false;
  return findDecompositions(tiles).length > 0;
}

/**
 * 计算常规和牌型的向听数。
 * 使用 DFS 深度优先搜索所有组合。
 * @param {string[]} tiles - 牌数组
 * @returns {number} 向听数（0 为听牌，-1 为和牌）
 */
export function regularShanten(tiles) {
  const c = countsFromTiles(tiles); let best = 8;
  const dfs = (idx, m, p, t) => {
    while (idx < 34 && c[idx] === 0) idx++;
    best = Math.min(best, 8 - m * 2 - t - p);
    if (idx >= 34) return;

    // 尝试组成面子（刻子）
    if (m < 4 && c[idx] >= 3) { c[idx] -= 3; dfs(idx, m + 1, p, t); c[idx] += 3; }
    // 尝试组成雀头
    if (!p && c[idx] >= 2) { c[idx] -= 2; dfs(idx, m, 1, t); c[idx] += 2; }
    // 尝试组成搭子（对子）
    if (t < 4 - m && c[idx] >= 2) { c[idx] -= 2; dfs(idx, m, p, t + 1); c[idx] += 2; }
    // 尝试组成顺子
    if (idx < 27 && idx % 9 <= 6 && c[idx + 1] && c[idx + 2]) {
      c[idx]--; c[idx + 1]--; c[idx + 2]--; dfs(idx, m + 1, p, t);
      c[idx]++; c[idx + 1]++; c[idx + 2]++;
    }
    // 尝试组成两面/边张搭子
    if (idx < 27 && idx % 9 <= 7 && c[idx + 1] && t < 4 - m) {
      c[idx]--; c[idx + 1]--; dfs(idx, m, p, t + 1);
      c[idx]++; c[idx + 1]++;
    }
    // 尝试组成嵌张搭子
    if (idx < 27 && idx % 9 <= 6 && c[idx + 2] && t < 4 - m) {
      c[idx]--; c[idx + 2]--; dfs(idx, m, p, t + 1);
      c[idx]++; c[idx + 2]++;
    }
    // 跳过这张牌
    c[idx]--; dfs(idx, m, p, t); c[idx]++;
  };
  dfs(0, 0, 0, 0);
  return best;
}

/** 计算七对子向听数 */
export function sevenPairsShanten(tiles) {
  const c = countsFromTiles(tiles);
  let p = 0, u = 0;
  for (const n of c) { if (n >= 2) p++; if (n > 0) u++; }
  return 6 - p + Math.max(0, 7 - u);
}

/** 计算十三幺向听数 */
export function thirteenOrphansShanten(tiles) {
  const c = countsFromTiles(tiles);
  let u = 0, pair = 0;
  for (const i of ORPHANS) { if (c[i]) u++; if (c[i] >= 2) pair = 1; }
  return 13 - u - pair;
}

/** 内部辅助函数：将索引转换为牌字符串 */
function indexToTile(i) {
  if (i < 9) return `${i + 1}m`;
  if (i < 18) return `${i - 8}s`;
  if (i < 27) return `${i - 17}p`;
  return ['E', 'S', 'W', 'N', 'C', 'F', 'P'][i - 27];
}

/**
 * 找出能让向听数减少的有效牌（进张）。
 * @param {string[]} tiles - 牌数组
 * @param {Function} shantenFn - 计算向听数的函数
 * @returns {string[]} 有效牌数组
 */
export function usefulTilesFor(tiles, shantenFn) {
  const base = shantenFn(tiles);
  const c = countsFromTiles(tiles);
  const useful = [];
  for (let i = 0; i < 34; i++) {
    if (c[i] >= 4) continue;
    const t = indexToTile(i);
    const next = shantenFn([...tiles, t]);
    if (next < base) useful.push(t);
  }
  return useful;
}
