/** 幺九牌（Terminal and Honor tiles）的索引列表 */
const ORPHANS = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

/**
 * 将牌字符串（如 '1m', 'E'）转换为 0-33 的索引。
 * @param {string} tile - 牌字符串
 * @returns {number} 索引值
 */
export function getTileIndex(tile) {
  const suits = { m: 0, s: 1, p: 2 };
  const honors = { E: 27, S: 28, W: 29, N: 30, C: 31, F: 32, P: 33 };
  if (tile.length === 2) return suits[tile[1]] * 9 + Number(tile[0]) - 1;
  return honors[tile];
}

/**
 * 将牌数组转换为长度为 34 的计数数组。
 * @param {string[]} tiles - 牌数组
 * @returns {number[]} 计数数组
 */
export function getTileCounts(tiles) {
  const counts = Array(34).fill(0);
  tiles.forEach(tile => counts[getTileIndex(tile)]++);
  return counts;
}

/**
 * 递归获取手牌的所有可能面子分解（顺子、刻子）。
 * @param {number[]} counts - 计数数组（会被修改，需注意还原）
 * @param {number} start - 开始扫描的索引
 * @returns {Array[]} 所有可能的分解方案数组
 */
function getDecompositions(counts, start = 0) {
  let index = start;
  while (index < 34 && counts[index] === 0) index++;
  if (index >= 34) return [[]];
  const results = [];

  // 尝试提取刻子
  if (counts[index] >= 3) {
    counts[index] -= 3;
    const subDecompositions = getDecompositions(counts, index);
    subDecompositions.forEach(scheme => results.push([{ type: 'PUNG', tile: tileFromIndex(index) }, ...scheme]));
    counts[index] += 3;
  }

  // 尝试提取顺子（仅限数牌）
  if (index < 27 && index % 9 <= 6 && counts[index + 1] && counts[index + 2]) {
    counts[index]--; counts[index + 1]--; counts[index + 2]--;
    const subDecompositions = getDecompositions(counts, index);
    subDecompositions.forEach(scheme => results.push([{ type: 'CHOW', tile: tileFromIndex(index + 1) }, ...scheme]));
    counts[index]++; counts[index + 1]++; counts[index + 2]++;
  }
  return results;
}

/**
 * 找出立牌中所有可能的“雀头 + 面子”分解方案。
 * @param {string[]} tiles - 立牌数组
 * @returns {Object[]} 分解方案列表，每个对象包含 pair 和 melds
 */
export function findDecompositions(tiles) {
  const counts = getTileCounts(tiles);
  const allDecompositions = [];
  for (let i = 0; i < 34; i++) {
    if (counts[i] >= 2) {
      counts[i] -= 2; // 尝试作为雀头
      const decompositions = getDecompositions(counts);
      decompositions.forEach(decomposition => allDecompositions.push({ pair: tileFromIndex(i), melds: decomposition }));
      counts[i] += 2;
    }
  }
  return allDecompositions;
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
export function getRegularShanten(tiles) {
  const counts = getTileCounts(tiles);
  let bestShanten = 8;
  const dfs = (index, meldCount, pairCount, taatsuCount) => {
    while (index < 34 && counts[index] === 0) index++;
    bestShanten = Math.min(bestShanten, 8 - meldCount * 2 - taatsuCount - pairCount);
    if (index >= 34) return;

    // 尝试组成面子（刻子）
    if (meldCount < 4 && counts[index] >= 3) {
      counts[index] -= 3;
      dfs(index, meldCount + 1, pairCount, taatsuCount);
      counts[index] += 3;
    }
    // 尝试组成雀头
    if (!pairCount && counts[index] >= 2) {
      counts[index] -= 2;
      dfs(index, meldCount, 1, taatsuCount);
      counts[index] += 2;
    }
    // 尝试组成搭子（对子）
    if (taatsuCount < 4 - meldCount && counts[index] >= 2) {
      counts[index] -= 2;
      dfs(index, meldCount, pairCount, taatsuCount + 1);
      counts[index] += 2;
    }
    // 尝试组成顺子
    if (index < 27 && index % 9 <= 6 && counts[index + 1] && counts[index + 2]) {
      counts[index]--; counts[index + 1]--; counts[index + 2]--;
      dfs(index, meldCount + 1, pairCount, taatsuCount);
      counts[index]++; counts[index + 1]++; counts[index + 2]++;
    }
    // 尝试组成两面/边张搭子
    if (index < 27 && index % 9 <= 7 && counts[index + 1] && taatsuCount < 4 - meldCount) {
      counts[index]--; counts[index + 1]--;
      dfs(index, meldCount, pairCount, taatsuCount + 1);
      counts[index]++; counts[index + 1]++;
    }
    // 尝试组成嵌张搭子
    if (index < 27 && index % 9 <= 6 && counts[index + 2] && taatsuCount < 4 - meldCount) {
      counts[index]--; counts[index + 2]--;
      dfs(index, meldCount, pairCount, taatsuCount + 1);
      counts[index]++; counts[index + 2]++;
    }
    // 跳过这张牌
    counts[index]--;
    dfs(index, meldCount, pairCount, taatsuCount);
    counts[index]++;
  };
  dfs(0, 0, 0, 0);
  return bestShanten;
}

/** 计算七对子向听数 */
export function getSevenPairsShanten(tiles) {
  const counts = getTileCounts(tiles);
  let pairCount = 0, uniqueCount = 0;
  for (const count of counts) {
    if (count >= 2) pairCount++;
    if (count > 0) uniqueCount++;
  }
  return 6 - pairCount + Math.max(0, 7 - uniqueCount);
}

/** 计算十三幺向听数 */
export function getThirteenOrphansShanten(tiles) {
  const counts = getTileCounts(tiles);
  let uniqueOrphanCount = 0, hasPair = 0;
  for (const i of ORPHANS) {
    if (counts[i]) uniqueOrphanCount++;
    if (counts[i] >= 2) hasPair = 1;
  }
  return 13 - uniqueOrphanCount - hasPair;
}

/** 内部辅助函数：将索引转换为牌字符串 */
function tileFromIndex(index) {
  if (index < 9) return `${index + 1}m`;
  if (index < 18) return `${index - 8}s`;
  if (index < 27) return `${index - 17}p`;
  return ['E', 'S', 'W', 'N', 'C', 'F', 'P'][index - 27];
}

/**
 * 找出能让向听数减少的有效牌（进张）。
 * @param {string[]} tiles - 牌数组
 * @param {Function} shantenFn - 计算向听数的函数
 * @returns {string[]} 有效牌数组
 */
export function getUsefulTiles(tiles, shantenFn) {
  const baseShanten = shantenFn(tiles);
  const counts = getTileCounts(tiles);
  const usefulTiles = [];
  for (let index = 0; index < 34; index++) {
    if (counts[index] >= 4) continue;
    const tile = tileFromIndex(index);
    if (shantenFn([...tiles, tile]) < baseShanten) usefulTiles.push(tile);
  }
  return usefulTiles;
}
