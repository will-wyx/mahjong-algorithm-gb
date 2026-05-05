import { getTileCounts, findDecompositions, getTileIndex } from './shanten.js';

/**
 * 国标麻将（GB/T 15364-1998）番值表
 * 包含全部 81 种番种及其分值
 */
export const FAN_VALUE = {
  // 88番
  BIG_FOUR_WINDS: 88,            // 大四喜
  BIG_THREE_DRAGONS: 88,         // 大三元
  ALL_GREEN: 88,                 // 绿一色
  NINE_GATES: 88,                // 九莲宝灯
  FOUR_KONGS: 88,                // 四杠
  SEVEN_SHIFTED_PAIRS: 88,       // 连七对
  THIRTEEN_ORPHANS: 88,          // 十三幺

  // 64番
  ALL_TERMINALS: 64,             // 清幺九
  LITTLE_FOUR_WINDS: 64,         // 小四喜
  LITTLE_THREE_DRAGONS: 64,      // 小三元
  ALL_HONORS: 64,                // 字一色
  FOUR_CONCEALED_PUNGS: 64,      // 四暗刻
  PURE_TERMINAL_CHOWS: 64,       // 一色双龙会

  // 48番
  QUADRUPLE_CHOW: 48,            // 一色四同顺
  FOUR_PURE_SHIFTED_PUNGS: 48,   // 一色四节高

  // 32番
  FOUR_PURE_SHIFTED_CHOWS: 32,   // 一色四步高
  THREE_KONGS: 32,               // 三杠
  ALL_TERMINALS_AND_HONORS: 32,  // 混幺九

  // 24番
  SEVEN_PAIRS: 24,                      // 七对
  GREATER_HONORS_AND_KNITTED_TILES: 24, // 七星不靠
  ALL_EVEN_PUNGS: 24,                   // 全双刻
  FULL_FLUSH: 24,                       // 清一色
  PURE_TRIPLE_CHOW: 24,                 // 一色三同顺
  PURE_SHIFTED_PUNGS: 24,               // 一色三节高
  UPPER_TILES: 24,                      // 全大
  MIDDLE_TILES: 24,                     // 全中
  LOWER_TILES: 24,                      // 全小

  // 16番
  PURE_STRAIGHT: 16,               // 清龙
  THREE_SUITED_TERMINAL_CHOWS: 16, // 三色双龙会
  PURE_SHIFTED_CHOWS: 16,          // 一色三步高
  ALL_FIVE: 16,                    // 全带五
  TRIPLE_PUNG: 16,                 // 三同刻
  THREE_CONCEALED_PUNGS: 16,       // 三暗刻

  // 12番
  LESSER_HONORS_AND_KNITTED_TILES: 12, // 全不靠
  KNITTED_STRAIGHT: 12,                // 组合龙
  UPPER_FOUR: 12,                      // 大于五
  LOWER_FOUR: 12,                      // 小于五
  BIG_THREE_WINDS: 12,                 // 三风刻

  // 8番
  MIXED_STRAIGHT: 8,               // 花龙
  REVERSIBLE_TILES: 8,             // 推不倒
  MIXED_TRIPLE_CHOW: 8,            // 三色三同顺
  MIXED_SHIFTED_PUNGS: 8,          // 三色三节高
  CHICKEN_HAND: 8,                 // 无番和
  LAST_TILE_DRAW: 8,               // 妙手回春
  LAST_TILE_CLAIM: 8,              // 海底捞月
  OUT_WITH_REPLACEMENT_TILE: 8,    // 杠上开花
  ROBBING_THE_KONG: 8,             // 抢杠和

  // 6番
  ALL_PUNGS: 6,                    // 碰碰和
  HALF_FLUSH: 6,                   // 混一色
  MIXED_SHIFTED_CHOWS: 6,          // 三色三步高
  ALL_TYPES: 6,                    // 五门齐
  MELDED_HAND: 6,                  // 全求人
  TWO_CONCEALED_KONGS: 6,          // 双暗杠
  TWO_DRAGONS_PUNGS: 6,            // 双箭刻

  // 4番
  OUTSIDE_HAND: 4,                 // 全带幺
  FULLY_CONCEALED_HAND: 4,         // 不求人
  TWO_MELDED_KONGS: 4,             // 双明杠
  LAST_TILE: 4,                    // 和绝张

  // 2番
  DRAGON_PUNG: 2,                  // 箭刻
  PREVALENT_WIND: 2,               // 圈风刻
  SEAT_WIND: 2,                    // 门风刻
  CONCEALED_HAND: 2,               // 门前清
  ALL_CHOWS: 2,                    // 平和
  TILE_HOG: 2,                     // 四归一
  DOUBLE_PUNG: 2,                  // 双同刻
  TWO_CONCEALED_PUNGS: 2,          // 双暗刻
  CONCEALED_KONG: 2,               // 暗杠
  ALL_SIMPLES: 2,                  // 断幺

  // 1番
  PURE_DOUBLE_CHOW: 1,             // 一般高
  MIXED_DOUBLE_CHOW: 1,            // 喜相逢
  SHORT_STRAIGHT: 1,               // 连六
  TWO_TERMINAL_CHOWS: 1,           // 老少副
  PUNG_OF_TERMINALS_OR_HONORS: 1,  // 幺九刻
  MELDED_KONG: 1,                  // 明杠
  ONE_VOIDED_SUIT: 1,              // 缺一门
  NO_HONORS: 1,                    // 无字
  EDGE_WAIT: 1,                    // 边张
  CLOSED_WAIT: 1,                  // 嵌张
  SINGLE_WAIT: 1,                  // 单钓将
  SELF_DRAWN: 1,                   // 自摸
  FLOWER_TILES: 1,                 // 花牌
  CONCEALED_KONG_AND_MELDED_KONG: 5 // 暗杠和明杠
};

/**
 * 番种中文名称映射
 */
export const FAN_NAME_ZH = {
  BIG_FOUR_WINDS: '大四喜',
  BIG_THREE_DRAGONS: '大三元',
  ALL_GREEN: '绿一色',
  NINE_GATES: '九莲宝灯',
  FOUR_KONGS: '四杠',
  SEVEN_SHIFTED_PAIRS: '连七对',
  THIRTEEN_ORPHANS: '十三幺',
  ALL_TERMINALS: '清幺九',
  LITTLE_FOUR_WINDS: '小四喜',
  LITTLE_THREE_DRAGONS: '小三元',
  ALL_HONORS: '字一色',
  FOUR_CONCEALED_PUNGS: '四暗刻',
  PURE_TERMINAL_CHOWS: '一色双龙会',
  QUADRUPLE_CHOW: '一色四同顺',
  FOUR_PURE_SHIFTED_PUNGS: '一色四节高',
  FOUR_PURE_SHIFTED_CHOWS: '一色四步高',
  THREE_KONGS: '三杠',
  ALL_TERMINALS_AND_HONORS: '混幺九',
  SEVEN_PAIRS: '七对',
  GREATER_HONORS_AND_KNITTED_TILES: '七星不靠',
  ALL_EVEN_PUNGS: '全双刻',
  FULL_FLUSH: '清一色',
  PURE_TRIPLE_CHOW: '一色三同顺',
  PURE_SHIFTED_PUNGS: '一色三节高',
  UPPER_TILES: '全大',
  MIDDLE_TILES: '全中',
  LOWER_TILES: '全小',
  PURE_STRAIGHT: '清龙',
  THREE_SUITED_TERMINAL_CHOWS: '三色双龙会',
  PURE_SHIFTED_CHOWS: '一色三步高',
  ALL_FIVE: '全带五',
  TRIPLE_PUNG: '三同刻',
  THREE_CONCEALED_PUNGS: '三暗刻',
  LESSER_HONORS_AND_KNITTED_TILES: '全不靠',
  KNITTED_STRAIGHT: '组合龙',
  UPPER_FOUR: '大于五',
  LOWER_FOUR: '小于五',
  BIG_THREE_WINDS: '三风刻',
  MIXED_STRAIGHT: '花龙',
  REVERSIBLE_TILES: '推不倒',
  MIXED_TRIPLE_CHOW: '三色三同顺',
  MIXED_SHIFTED_PUNGS: '三色三节高',
  CHICKEN_HAND: '无番和',
  LAST_TILE_DRAW: '妙手回春',
  LAST_TILE_CLAIM: '海底捞月',
  OUT_WITH_REPLACEMENT_TILE: '杠上开花',
  ROBBING_THE_KONG: '抢杠和',
  ALL_PUNGS: '碰碰和',
  HALF_FLUSH: '混一色',
  MIXED_SHIFTED_CHOWS: '三色三步高',
  ALL_TYPES: '五门齐',
  MELDED_HAND: '全求人',
  TWO_CONCEALED_KONGS: '双暗杠',
  TWO_DRAGONS_PUNGS: '双箭刻',
  OUTSIDE_HAND: '全带幺',
  FULLY_CONCEALED_HAND: '不求人',
  TWO_MELDED_KONGS: '双明杠',
  LAST_TILE: '和绝张',
  DRAGON_PUNG: '箭刻',
  PREVALENT_WIND: '圈风刻',
  SEAT_WIND: '门风刻',
  CONCEALED_HAND: '门前清',
  ALL_CHOWS: '平和',
  TILE_HOG: '四归一',
  DOUBLE_PUNG: '双同刻',
  TWO_CONCEALED_PUNGS: '双暗刻',
  CONCEALED_KONG: '暗杠',
  ALL_SIMPLES: '断幺',
  PURE_DOUBLE_CHOW: '一般高',
  MIXED_DOUBLE_CHOW: '喜相逢',
  SHORT_STRAIGHT: '连六',
  TWO_TERMINAL_CHOWS: '老少副',
  PUNG_OF_TERMINALS_OR_HONORS: '幺九刻',
  MELDED_KONG: '明杠',
  ONE_VOIDED_SUIT: '缺一门',
  NO_HONORS: '无字',
  EDGE_WAIT: '边张',
  CLOSED_WAIT: '嵌张',
  SINGLE_WAIT: '单钓将',
  SELF_DRAWN: '自摸',
  FLOWER_TILES: '花牌',
  CONCEALED_KONG_AND_MELDED_KONG: '暗杠和明杠'
};

/**
 * 内部辅助函数：获取花色。
 * @param {number} tile - 牌的十六进制编码
 * @returns {number} 花色值 (0:万, 1:条, 2:筒, 4:字)
 */
function getTileSuit(tile) { return (tile >> 4) & 0xF; }

/**
 * 内部辅助函数：获取序数。
 * @param {number} tile - 牌的十六进制编码
 * @returns {number} 序数值 (1-9)
 */
function getTileRank(tile) { return tile & 0xF; }

/**
 * 内部辅助函数：构造牌。
 * @param {number} suit - 花色
 * @param {number} rank - 序数
 * @returns {number} 牌的十六进制编码
 */
function makeTile(suit, rank) { return (suit << 4) | rank; }

/**
 * 是否为序数牌（万筒条）。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isNumberedSuit(tile) { return !(tile & 0xC0); }

/**
 * 是否为幺九牌（1或9）。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isTerminal(tile) { return (tile & 0xC7) === 1; }

/**
 * 是否为字牌。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isHonor(tile) { return tile > 0x40 && tile < 0x48; }

/**
 * 是否为幺九牌或字牌。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isTerminalOrHonor(tile) { return isTerminal(tile) || isHonor(tile); }

/**
 * 是否为风牌（东南西北）。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isWind(tile) { return tile > 0x40 && tile < 0x45; }

/**
 * 是否为箭牌（中发白）。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isDragon(tile) { return tile > 0x44 && tile < 0x48; }

/**
 * 是否为绿一色相关的牌。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isGreen(tile) { return [0x22, 0x23, 0x24, 0x26, 0x28, 0x46].includes(tile); }

/**
 * 是否为推不倒相关的牌。
 * @param {number} tile - 牌的十六进制编码
 * @returns {boolean}
 */
function isReversible(tile) { return [0x22, 0x24, 0x25, 0x26, 0x28, 0x29, 0x31, 0x32, 0x33, 0x34, 0x35, 0x38, 0x39, 0x47].includes(tile); }

/** 内部映射表：牌名字到十六进制编码 */
const TILE_MAP = {
  '1m': 0x11, '2m': 0x12, '3m': 0x13, '4m': 0x14, '5m': 0x15, '6m': 0x16, '7m': 0x17, '8m': 0x18, '9m': 0x19,
  '1s': 0x21, '2s': 0x22, '3s': 0x23, '4s': 0x24, '5s': 0x25, '6s': 0x26, '7s': 0x27, '8s': 0x28, '9s': 0x29,
  '1p': 0x31, '2p': 0x32, '3p': 0x33, '4p': 0x34, '5p': 0x35, '6p': 0x36, '7p': 0x37, '8p': 0x38, '9p': 0x39,
  'E': 0x41, 'S': 0x42, 'W': 0x43, 'N': 0x44, 'C': 0x45, 'F': 0x46, 'P': 0x47
};

/**
 * 转换牌字符串为十六进制。
 * @param {string} tile - 牌字符串 (如 '1m')
 * @returns {number} 十六进制编码
 */
function toHexTile(tile) { return TILE_MAP[tile]; }

/** 标准十三幺牌型 */
const STANDARD_THIRTEEN_ORPHANS = [0x11, 0x19, 0x21, 0x29, 0x31, 0x39, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47];
/** 标准组合龙牌型（6种） */
const STANDARD_KNITTED_STRAIGHT = [
  [0x11, 0x14, 0x17, 0x22, 0x25, 0x28, 0x33, 0x36, 0x39],
  [0x11, 0x14, 0x17, 0x23, 0x26, 0x29, 0x32, 0x35, 0x38],
  [0x12, 0x15, 0x18, 0x21, 0x24, 0x27, 0x33, 0x36, 0x39],
  [0x12, 0x15, 0x18, 0x23, 0x26, 0x29, 0x31, 0x34, 0x37],
  [0x13, 0x16, 0x19, 0x21, 0x24, 0x27, 0x32, 0x35, 0x38],
  [0x13, 0x16, 0x19, 0x22, 0x25, 0x28, 0x31, 0x34, 0x37]
];

/**
 * 辅助检测函数：检查四组连续序数。
 * @param {number} r0 - 序数0
 * @param {number} r1 - 序数1
 * @param {number} r2 - 序数2
 * @param {number} r3 - 序数3
 * @returns {boolean}
 */
function isFourShifted1(r0, r1, r2, r3) { return r0 + 1 === r1 && r1 + 1 === r2 && r2 + 1 === r3; }

/**
 * 辅助检测函数：检查四组等差序数（步长为2）。
 * @param {number} r0 - 序数0
 * @param {number} r1 - 序数1
 * @param {number} r2 - 序数2
 * @param {number} r3 - 序数3
 * @returns {boolean}
 */
function isFourShifted2(r0, r1, r2, r3) { return r0 + 2 === r1 && r1 + 2 === r2 && r2 + 2 === r3; }

/**
 * 辅助检测函数：检查三组连续序数。
 * @param {number} r0 - 序数0
 * @param {number} r1 - 序数1
 * @param {number} r2 - 序数2
 * @returns {boolean}
 */
function isShifted1(r0, r1, r2) { return r0 + 1 === r1 && r1 + 1 === r2; }

/**
 * 辅助检测函数：检查三组等差序数（步长为2）。
 * @param {number} r0 - 序数0
 * @param {number} r1 - 序数1
 * @param {number} r2 - 序数2
 * @returns {boolean}
 */
function isShifted2(r0, r1, r2) { return r0 + 2 === r1 && r1 + 2 === r2; }

/**
 * 辅助检测函数：检查三组无序连续序数。
 * @param {number} r0 - 序数0
 * @param {number} r1 - 序数1
 * @param {number} r2 - 序数2
 * @returns {boolean}
 */
function isShifted1Unordered(r0, r1, r2) {
  const [a, b, c] = [r0, r1, r2].sort((x, y) => x - y);
  return a + 1 === b && b + 1 === c;
}

/**
 * 辅助检测函数：检查三组花色是否互不相同。
 * @param {number} s0 - 花色0
 * @param {number} s1 - 花色1
 * @param {number} s2 - 花色2
 * @returns {boolean}
 */
function isMixed(s0, s1, s2) { return s0 !== s1 && s0 !== s2 && s1 !== s2; }

/**
 * 识别 4 组顺子构成的番种（一色四节高、一色四同顺等）。
 * @param {number} t0 - 顺子0的代表牌
 * @param {number} t1 - 顺子1的代表牌
 * @param {number} t2 - 顺子2的代表牌
 * @param {number} t3 - 顺子3的代表牌
 * @returns {string|null} 番种名称
 */
function get4ChowsFan(t0, t1, t2, t3) {
  const ranks = [t0, t1, t2, t3].map(getTileRank).sort((a, b) => a - b);
  if (isFourShifted2(ranks[0], ranks[1], ranks[2], ranks[3])) return 'FOUR_PURE_SHIFTED_CHOWS';
  if (isFourShifted1(ranks[0], ranks[1], ranks[2], ranks[3])) return 'FOUR_PURE_SHIFTED_CHOWS';
  if (t0 === t1 && t1 === t2 && t2 === t3) return 'QUADRUPLE_CHOW';
  return null;
}

/**
 * 识别 3 组顺子构成的番种（一色三同顺、组合龙等）。
 * @param {number} t0 - 顺子0的代表牌
 * @param {number} t1 - 顺子1的代表牌
 * @param {number} t2 - 顺子2的代表牌
 * @returns {string|null} 番种名称
 */
function get3ChowsFan(t0, t1, t2) {
  const suits = [t0, t1, t2].map(getTileSuit);
  const ranks = [t0, t1, t2].map(getTileRank);
  if (isMixed(suits[0], suits[1], suits[2])) {
    if (isShifted1Unordered(ranks[0], ranks[1], ranks[2])) return 'MIXED_SHIFTED_CHOWS';
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) return 'MIXED_TRIPLE_CHOW';
    const sortedRanks = [...ranks].sort((a, b) => a - b);
    if (sortedRanks[0] === 2 && sortedRanks[1] === 5 && sortedRanks[2] === 8) return 'MIXED_STRAIGHT';
  } else if (suits[0] === suits[1] && suits[1] === suits[2]) {
    const sortedTiles = [t0, t1, t2].sort((a, b) => a - b);
    if (sortedTiles[0] + 3 === sortedTiles[1] && sortedTiles[1] + 3 === sortedTiles[2]) return 'PURE_STRAIGHT';
    const sortedRanks = [...ranks].sort((a, b) => a - b);
    if (isShifted2(sortedRanks[0], sortedRanks[1], sortedRanks[2])) return 'PURE_SHIFTED_CHOWS';
    if (isShifted1(sortedRanks[0], sortedRanks[1], sortedRanks[2])) return 'PURE_SHIFTED_CHOWS';
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) return 'PURE_TRIPLE_CHOW';
  }
  return null;
}

/**
 * 识别 2 组顺子构成的番种（喜相逢、一般高、连六、老少副）。
 * @param {number} t0 - 顺子0的代表牌
 * @param {number} t1 - 顺子1的代表牌
 * @returns {string|null} 番种名称
 */
function get2ChowsFanUnordered(t0, t1) {
  if (getTileSuit(t0) !== getTileSuit(t1)) {
    if (getTileRank(t0) === getTileRank(t1)) return 'MIXED_DOUBLE_CHOW';
  } else {
    const ranks = [getTileRank(t0), getTileRank(t1)].sort((a, b) => a - b);
    if (ranks[0] + 3 === ranks[1]) return 'SHORT_STRAIGHT';
    if (ranks[0] === 2 && ranks[1] === 8) return 'TWO_TERMINAL_CHOWS';
    if (ranks[0] === ranks[1]) return 'PURE_DOUBLE_CHOW';
  }
  return null;
}

/**
 * 识别 4 组刻子构成的番种（一色四节高、大四喜）。
 * @param {number} t0 - 刻子0的代表牌
 * @param {number} t1 - 刻子1的代表牌
 * @param {number} t2 - 刻子2的代表牌
 * @param {number} t3 - 刻子3的代表牌
 * @returns {string|null} 番种名称
 */
function get4PungsFan(t0, t1, t2, t3) {
  const sortedTiles = [t0, t1, t2, t3].sort((a, b) => a - b);
  if (isNumberedSuit(sortedTiles[0]) && sortedTiles[0] + 1 === sortedTiles[1] && sortedTiles[1] + 1 === sortedTiles[2] && sortedTiles[2] + 1 === sortedTiles[3]) return 'FOUR_PURE_SHIFTED_PUNGS';
  if (sortedTiles[0] === 0x41 && sortedTiles[1] === 0x42 && sortedTiles[2] === 0x43 && sortedTiles[3] === 0x44) return 'BIG_FOUR_WINDS';
  return null;
}

/**
 * 识别 3 组刻子构成的番种（三同刻、三风刻、大三元等）。
 * @param {number} t0 - 刻子0的代表牌
 * @param {number} t1 - 刻子1的代表牌
 * @param {number} t2 - 刻子2的代表牌
 * @returns {string|null} 番种名称
 */
function get3PungsFan(t0, t1, t2) {
  const sortedTiles = [t0, t1, t2].sort((a, b) => a - b);
  if (isNumberedSuit(sortedTiles[0]) && isNumberedSuit(sortedTiles[1]) && isNumberedSuit(sortedTiles[2])) {
    const suits = sortedTiles.map(getTileSuit);
    const ranks = sortedTiles.map(getTileRank);
    if (isMixed(suits[0], suits[1], suits[2])) {
      if (isShifted1Unordered(ranks[0], ranks[1], ranks[2])) return 'MIXED_SHIFTED_PUNGS';
      if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) return 'TRIPLE_PUNG';
    } else if (suits[0] === suits[1] && suits[1] === suits[2]) {
      if (ranks[0] + 1 === ranks[1] && ranks[1] + 1 === ranks[2]) return 'PURE_SHIFTED_PUNGS';
    }
  } else {
    if (sortedTiles[0] === 0x41 && sortedTiles[1] === 0x42 && (sortedTiles[2] === 0x43 || sortedTiles[2] === 0x44)) return 'BIG_THREE_WINDS';
    if (sortedTiles[0] === 0x41 && sortedTiles[1] === 0x43 && sortedTiles[2] === 0x44) return 'BIG_THREE_WINDS';
    if (sortedTiles[0] === 0x42 && sortedTiles[1] === 0x43 && sortedTiles[2] === 0x44) return 'BIG_THREE_WINDS';
    if (sortedTiles[0] === 0x45 && sortedTiles[1] === 0x46 && sortedTiles[2] === 0x47) return 'BIG_THREE_DRAGONS';
  }
  return null;
}

/**
 * 识别 2 组刻子构成的番种（双同刻、双箭刻）。
 * @param {number} t0 - 刻子0的代表牌
 * @param {number} t1 - 刻子1的代表牌
 * @returns {string|null} 番种名称
 */
function get2PungsFanUnordered(t0, t1) {
  if (isNumberedSuit(t0) && isNumberedSuit(t1)) {
    if (getTileRank(t0) === getTileRank(t1)) return 'DOUBLE_PUNG';
  } else {
    if (isDragon(t0) && isDragon(t1)) return 'TWO_DRAGONS_PUNGS';
  }
  return null;
}

/**
 * 识别单组刻子番种（箭刻、幺九刻）。
 * @param {number} midTile - 刻子的代表牌
 * @returns {string|null} 番种名称
 */
function get1PungFan(midTile) {
  if (isDragon(midTile)) return 'DRAGON_PUNG';
  if (isTerminal(midTile) || isWind(midTile)) return 'PUNG_OF_TERMINALS_OR_HONORS';
  return null;
}

/** 
 * 套算一次原则的处理逻辑。
 * 按照规则，若有多组番，需根据最大组合数削减重复计分。
 * @param {string[]} allFans - 所有待检查的番种数组
 * @param {number} maxCount - 最大允许计分的番种数量
 * @param {Object} fanTable - 结果番表
 */
function exclusionaryRule(allFans, maxCount, fanTable) {
  const table = { PURE_DOUBLE_CHOW: 0, MIXED_DOUBLE_CHOW: 0, SHORT_STRAIGHT: 0, TWO_TERMINAL_CHOWS: 0 };
  let count = 0;
  allFans.forEach(fan => {
    if (fan && table[fan] !== undefined) { count++; table[fan]++; }
  });

  let limit = 1;
  while (count > maxCount && limit >= 0) {
    const keys = ['TWO_TERMINAL_CHOWS', 'SHORT_STRAIGHT', 'MIXED_DOUBLE_CHOW', 'PURE_DOUBLE_CHOW'];
    for (const key of keys) {
      while (table[key] > limit && count > maxCount) { table[key]--; count--; }
    }
    limit--;
  }
  Object.entries(table).forEach(([key, value]) => {
    if (value > 0) fanTable[key] = (fanTable[key] || 0) + value;
  });
}

/**
 * 计算 4 组顺子中的前 3 组及第 4 组的组合番。
 * @param {number} t0 - 顺子0
 * @param {number} t1 - 顺子1
 * @param {number} t2 - 顺子2
 * @param {number} extraTile - 第4组顺子
 * @param {Object} fanTable - 番表
 * @returns {boolean} 是否计算成功
 */
function calculate3of4Chows(t0, t1, t2, extraTile, fanTable) {
  const fan = get3ChowsFan(t0, t1, t2);
  if (fan) {
    fanTable[fan] = 1;
    const f1 = get2ChowsFanUnordered(t0, extraTile);
    const f2 = get2ChowsFanUnordered(t1, extraTile);
    const f3 = get2ChowsFanUnordered(t2, extraTile);
    const options = [f1, f2, f3];
    const extra = options.find(f => f === 'PURE_DOUBLE_CHOW') ||
                  options.find(f => f === 'MIXED_DOUBLE_CHOW') ||
                  options.find(f => f === 'SHORT_STRAIGHT') ||
                  options.find(f => f === 'TWO_TERMINAL_CHOWS');
    if (extra) fanTable[extra] = (fanTable[extra] || 0) + 1;
    return true;
  }
  return false;
}

/**
 * 综合计算 4 组顺子的番种。
 * @param {number[]} midTiles - 4组顺子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate4Chows(midTiles, fanTable) {
  const fan = get4ChowsFan(midTiles[0], midTiles[1], midTiles[2], midTiles[3]);
  if (fan) { fanTable[fan] = 1; return; }
  if (calculate3of4Chows(midTiles[0], midTiles[1], midTiles[2], midTiles[3], fanTable) ||
      calculate3of4Chows(midTiles[0], midTiles[1], midTiles[3], midTiles[2], fanTable) ||
      calculate3of4Chows(midTiles[0], midTiles[2], midTiles[3], midTiles[1], fanTable) ||
      calculate3of4Chows(midTiles[1], midTiles[2], midTiles[3], midTiles[0], fanTable)) return;
  
  const allFans = [];
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      allFans.push(get2ChowsFanUnordered(midTiles[i], midTiles[j]));
    }
  }
  let maxCount = 3;
  if (!allFans[0] && !allFans[1] && !allFans[2]) maxCount--;
  if (!allFans[0] && !allFans[3] && !allFans[4]) maxCount--;
  if (!allFans[1] && !allFans[3] && !allFans[5]) maxCount--;
  if (!allFans[2] && !allFans[4] && !allFans[5]) maxCount--;
  if (maxCount > 0) exclusionaryRule(allFans, maxCount, fanTable);
}

/**
 * 计算杠相关的番种（四杠、三杠、明暗杠组合等）。
 * @param {number} concealedPungCount - 暗刻数量
 * @param {number} meldedKongCount - 明杠数量
 * @param {number} concealedKongCount - 暗杠数量
 * @param {Object} fanTable - 番表
 */
function calculateKongs(concealedPungCount, meldedKongCount, concealedKongCount, fanTable) {
  const total = meldedKongCount + concealedKongCount;
  if (total === 0) {
    if (concealedPungCount === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concealedPungCount === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    else if (concealedPungCount === 4) fanTable.FOUR_CONCEALED_PUNGS = 1;
  } else if (total === 1) {
    if (meldedKongCount === 1) {
      fanTable.MELDED_KONG = 1;
      if (concealedPungCount === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concealedPungCount === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    } else {
      fanTable.CONCEALED_KONG = 1;
      if (concealedPungCount === 1) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concealedPungCount === 2) fanTable.THREE_CONCEALED_PUNGS = 1;
      else if (concealedPungCount === 3) fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 2) {
    if (concealedKongCount === 0) {
      fanTable.TWO_MELDED_KONGS = 1;
      if (concealedPungCount === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    } else if (concealedKongCount === 1) {
      fanTable.CONCEALED_KONG_AND_MELDED_KONG = 1;
      if (concealedPungCount === 1) fanTable.TWO_CONCEALED_PUNGS = 1;
      else if (concealedPungCount === 2) fanTable.THREE_CONCEALED_PUNGS = 1;
    } else {
      fanTable.TWO_CONCEALED_KONGS = 1;
      if (concealedPungCount === 1) fanTable.THREE_CONCEALED_PUNGS = 1;
      else if (concealedPungCount === 2) fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 3) {
    fanTable.THREE_KONGS = 1;
    if (concealedKongCount === 1 && concealedPungCount > 0) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concealedKongCount === 2) {
      if (concealedPungCount === 0) fanTable.TWO_CONCEALED_PUNGS = 1; else fanTable.THREE_CONCEALED_PUNGS = 1;
    } else if (concealedKongCount === 3) {
      if (concealedPungCount === 0) fanTable.THREE_CONCEALED_PUNGS = 1; else fanTable.FOUR_CONCEALED_PUNGS = 1;
    }
  } else if (total === 4) {
    fanTable.FOUR_KONGS = 1;
    if (concealedPungCount === 2) fanTable.TWO_CONCEALED_PUNGS = 1;
    else if (concealedPungCount === 3) fanTable.THREE_CONCEALED_PUNGS = 1;
    else if (concealedPungCount === 4) fanTable.FOUR_CONCEALED_PUNGS = 1;
  }
}

/**
 * 识别 4 组刻子的番种及其两两关系。
 * @param {number[]} midTiles - 4组刻子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate4Pungs(midTiles, fanTable) {
  const fan = get4PungsFan(midTiles[0], midTiles[1], midTiles[2], midTiles[3]);
  if (fan) { fanTable[fan] = 1; return; }
  let hasThreePungs = false, freeIndex = -1;
  for (let index = 0; index < 4; index++) {
    const otherTiles = midTiles.filter((_, idx) => idx !== index);
    const threePungsFan = get3PungsFan(otherTiles[0], otherTiles[1], otherTiles[2]);
    if (threePungsFan) { fanTable[threePungsFan] = 1; freeIndex = index; hasThreePungs = true; break; }
  }
  if (hasThreePungs) {
    for (let index = 0; index < 4; index++) {
      if (index !== freeIndex) {
        const twoPungsFan = get2PungsFanUnordered(midTiles[index], midTiles[freeIndex]);
        if (twoPungsFan) { fanTable[twoPungsFan] = (fanTable[twoPungsFan] || 0) + 1; break; }
      }
    }
    return;
  }
  for (let index = 0; index < 4; index++) {
    for (let innerIndex = index + 1; innerIndex < 4; innerIndex++) {
      const twoPungsFan = get2PungsFanUnordered(midTiles[index], midTiles[innerIndex]);
      if (twoPungsFan) fanTable[twoPungsFan] = (fanTable[twoPungsFan] || 0) + 1;
    }
  }
}

/**
 * 识别 3 组顺子的番种。
 * @param {number[]} midTiles - 3组顺子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate3Chows(midTiles, fanTable) {
  const fan = get3ChowsFan(midTiles[0], midTiles[1], midTiles[2]);
  if (fan) { fanTable[fan] = 1; return; }
  const allFans = [
    get2ChowsFanUnordered(midTiles[0], midTiles[1]),
    get2ChowsFanUnordered(midTiles[0], midTiles[2]),
    get2ChowsFanUnordered(midTiles[1], midTiles[2])
  ];
  exclusionaryRule(allFans, 2, fanTable);
}

/**
 * 识别 3 组刻子的番种。
 * @param {number[]} midTiles - 3组刻子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate3Pungs(midTiles, fanTable) {
  const fan = get3PungsFan(midTiles[0], midTiles[1], midTiles[2]);
  if (fan) { fanTable[fan] = 1; return; }
  for (let index = 0; index < 3; index++) {
    for (let innerIndex = index + 1; innerIndex < 3; innerIndex++) {
      const twoPungsFan = get2PungsFanUnordered(midTiles[index], midTiles[innerIndex]);
      if (twoPungsFan) fanTable[twoPungsFan] = (fanTable[twoPungsFan] || 0) + 1;
    }
  }
}

/**
 * 计算 2 组无序顺子的番种。
 * @param {number[]} midTiles - 2组顺子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate2ChowsUnordered(midTiles, fanTable) {
  const fan = get2ChowsFanUnordered(midTiles[0], midTiles[1]);
  if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
}

/**
 * 计算 2 组无序刻子的番种。
 * @param {number[]} midTiles - 2组刻子的代表牌数组
 * @param {Object} fanTable - 番表
 */
function calculate2PungsUnordered(midTiles, fanTable) {
  const fan = get2PungsFanUnordered(midTiles[0], midTiles[1]);
  if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
}

/**
 * 根据和牌方式（绝张、自摸、海底等）调整番表。
 * @param {number} winFlag - 和牌标志位
 * @param {Object} fanTable - 番表
 */
function adjustByWinFlag(winFlag, fanTable) {
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

/**
 * 专门针对特殊和型的和牌方式调整。
 * @param {number} seatWind - 门风
 * @param {number} winFlag - 和牌标志位
 * @param {Object} fanTable - 番表
 */
function adjustByWinFlagForSpecialForm(seatWind, winFlag, fanTable) {
  adjustByWinFlag(winFlag, fanTable);
}

/**
 * 调整花色相关番种（无字、缺一门、清一色、五门齐等）。
 * @param {number[]} tiles - 所有牌的十六进制编码数组
 * @param {Object} fanTable - 番表
 */
function adjustBySuits(tiles, fanTable) {
  let suitFlag = 0;
  tiles.forEach(tile => suitFlag |= (1 << getTileSuit(tile)));
  if (!(suitFlag & 0xF1)) fanTable.NO_HONORS = 1;
  let voided = 0;
  if (!(suitFlag & 0xE3)) voided++;
  if (!(suitFlag & 0xE5)) voided++;
  if (!(suitFlag & 0xE9)) voided++;
  if (voided === 2) {
    if (!fanTable.NO_HONORS) fanTable.HALF_FLUSH = 1;
    else { fanTable.FULL_FLUSH = 1; delete fanTable.NO_HONORS; }
  } else if (voided === 1) fanTable.ONE_VOIDED_SUIT = 1;
  if (suitFlag === 0x1E && tiles.some(isWind) && tiles.some(isDragon)) fanTable.ALL_TYPES = 1;
}

/**
 * 调整数项范围相关番种（全大、全中、全小、大于五、小于五）。
 * @param {number[]} tiles - 所有牌的十六进制编码数组
 * @param {Object} fanTable - 番表
 */
function adjustByRankRange(tiles, fanTable) {
  if (tiles.some(tile => !isNumberedSuit(tile))) return;
  let rankFlag = 0;
  tiles.forEach(tile => rankFlag |= (1 << getTileRank(tile)));
  if (!(rankFlag & 0xFFE1)) fanTable[rankFlag & 0x0010 ? 'LOWER_FOUR' : 'LOWER_TILES'] = 1;
  else if (!(rankFlag & 0xFC3F)) fanTable[rankFlag & 0x0040 ? 'UPPER_FOUR' : 'UPPER_TILES'] = 1;
  else if (!(rankFlag & 0xFF8F)) fanTable.MIDDLE_TILES = 1;
}

/**
 * 调整手牌特征相关番种（断幺、推不倒、绿一色、字一色、清幺九等）。
 * @param {number[]} tiles - 所有牌的十六进制编码数组
 * @param {Object} fanTable - 番表
 */
function adjustByTilesTraits(tiles, fanTable) {
  if (tiles.every(tile => !isTerminalOrHonor(tile))) fanTable.ALL_SIMPLES = 1;
  if (tiles.every(isReversible)) fanTable.REVERSIBLE_TILES = 1;
  if (tiles.every(isGreen)) fanTable.ALL_GREEN = 1;
  if (fanTable.ALL_SIMPLES) return;
  if (tiles.every(isHonor)) { fanTable.ALL_HONORS = 1; return; }
  if (tiles.every(isTerminal)) { fanTable.ALL_TERMINALS = 1; return; }
  if (tiles.every(isTerminalOrHonor)) fanTable.ALL_TERMINALS_AND_HONORS = 1;
}

/**
 * 调整四归一番种（需扣除杠的张数）。
 * @param {number[]} counts - 牌计数数组
 * @param {number} kongCount - 杠的数量
 * @param {Object} fanTable - 番表
 */
function adjustByTilesHog(counts, kongCount, fanTable) {
  let hog = 0;
  counts.forEach(count => { if (count === 4) hog++; });
  if (hog > kongCount) fanTable.TILE_HOG = hog - kongCount;
}

/** 
 * 最终调整逻辑。
 * 处理国标麻将中的“套算一次原则”，删除互斥的低番，保留高番。
 * @param {Object} fanTable - 番表
 */
function finalAdjust(fanTable) {
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

/**
 * 是否满足七对（及更高级的七对变种）。
 * @param {number[]} counts - 牌计数数组
 * @returns {boolean}
 */
function isSevenPairs(counts) {
  let pairs = 0;
  for (let index = 0; index < 0x59; index++) if (counts[index]) {
    if (counts[index] % 2 !== 0) return false;
    pairs += counts[index] / 2;
  }
  return pairs === 7;
}

/**
 * 是否满足连七对（七对且为同序数连续）。
 * @param {number[]} counts - 牌计数数组
 * @param {number} suit - 花色
 * @returns {boolean}
 */
function isSevenShiftedPairs(counts, suit) {
  if (suit === 4) return false;
  const startTile = makeTile(suit, 3);
  if (counts[startTile] === 2 && counts[startTile + 1] === 2 && counts[startTile + 2] === 2 && counts[startTile + 3] === 2 && counts[startTile + 4] === 2) {
    if (counts[startTile - 1] === 2) return counts[startTile - 2] === 2 || counts[startTile + 5] === 2;
    return counts[startTile + 5] === 2 && counts[startTile + 6] === 2;
  }
  return false;
}

/**
 * 是否满足十三幺。
 * @param {number[]} uniqueTiles - 不重复牌的十六进制编码数组
 * @returns {boolean}
 */
function isThirteenOrphans(uniqueTiles) {
  if (uniqueTiles.length !== 13) return false;
  const sorted = [...uniqueTiles].sort();
  const standardOrphans = [...STANDARD_THIRTEEN_ORPHANS].sort();
  return sorted.every((tile, index) => tile === standardOrphans[index]);
}

/**
 * 计算全不靠、七星不靠、组合龙相关番种。
 * @param {number[]} uniqueTiles - 不重复牌的十六进制编码数组
 * @param {Object} fanTable - 番表
 * @returns {boolean} 是否符合此类牌型
 */
function calculateHonorsAndKnittedTiles(uniqueTiles, fanTable) {
  if (uniqueTiles.length !== 14) return false;
  const numberedTiles = uniqueTiles.filter(tile => !isHonor(tile)).sort();
  if (numberedTiles.length > 9 || numberedTiles.length < 7) return false;
  if (!STANDARD_KNITTED_STRAIGHT.some(sequence => sequence.every(tile => uniqueTiles.includes(tile)))) return false;
  const honorTiles = uniqueTiles.filter(isHonor).sort();
  if (numberedTiles.length === 7 && honorTiles.length === 7) { fanTable.GREATER_HONORS_AND_KNITTED_TILES = 1; return true; }
  const standardHonors = STANDARD_THIRTEEN_ORPHANS.slice(6);
  if (honorTiles.every(honor => standardHonors.includes(honor))) {
    fanTable.LESSER_HONORS_AND_KNITTED_TILES = 1;
    if (numberedTiles.length === 9) fanTable.KNITTED_STRAIGHT = 1;
    return true;
  }
  return false;
}

/**
 * 计算特殊和型（七对、全不靠、十三幺）。
 * @param {number[]} counts - 牌计数数组
 * @param {number[]} hexAll - 所有牌的十六进制编码数组
 * @param {number[]} uniqueTiles - 不重复牌的十六进制编码数组
 * @param {number} winTile - 和牌张的十六进制编码
 * @param {number} seatWind - 门风
 * @param {number} winFlag - 和牌标志位
 * @param {Object} fanTable - 番表
 * @returns {boolean} 是否为特殊和型
 */
function calculateSpecialFormFan(counts, hexAll, uniqueTiles, winTile, seatWind, winFlag, fanTable) {
  if (isSevenPairs(counts)) {
    const suit = getTileSuit(winTile);
    if (isSevenShiftedPairs(counts, suit)) {
      fanTable.SEVEN_SHIFTED_PAIRS = 1;
      if (counts[makeTile(suit, 1)] === 0 && counts[makeTile(suit, 9)] === 0) fanTable.ALL_SIMPLES = 1;
      adjustByWinFlagForSpecialForm(seatWind, winFlag, fanTable);
    } else {
      fanTable.SEVEN_PAIRS = 1;
      adjustBySuits(uniqueTiles, fanTable);
      adjustByTilesTraits(uniqueTiles, fanTable);
      adjustByRankRange(uniqueTiles, fanTable);
      adjustByTilesHog(counts, 0, fanTable);
      adjustByWinFlagForSpecialForm(seatWind, winFlag, fanTable);
      finalAdjust(fanTable);
    }
    return true;
  }
  if (calculateHonorsAndKnittedTiles(uniqueTiles, fanTable)) {
    adjustByWinFlagForSpecialForm(seatWind, winFlag, fanTable);
    return true;
  }
  if (isThirteenOrphans(uniqueTiles)) {
    fanTable.THIRTEEN_ORPHANS = 1;
    adjustByWinFlagForSpecialForm(seatWind, winFlag, fanTable);
    return true;
  }
  return false;
}

/**
 * 根据和牌状态调整自摸、门清等番种。
 * @param {Object[]} melds - 面子数组
 * @param {boolean} selfDrawn - 是否为自摸
 * @param {Object} fanTable - 番表
 */
function adjustBySelfDrawn(melds, selfDrawn, fanTable) {
  const meldedCount = melds.filter(meld => meld.melded).length;
  if (meldedCount === 0) fanTable[selfDrawn ? 'FULLY_CONCEALED_HAND' : 'CONCEALED_HAND'] = 1;
  else if (meldedCount === 4) fanTable[selfDrawn ? 'SELF_DRAWN' : 'MELDED_HAND'] = 1;
  else if (selfDrawn) fanTable.SELF_DRAWN = 1;
}

/**
 * 根据雀头调整番种（平和、小三元、小四喜等）。
 * @param {number} pairTile - 雀头的十六进制编码
 * @param {number} chowCount - 顺子数量
 * @param {Object} fanTable - 番表
 */
function adjustByPairTile(pairTile, chowCount, fanTable) {
  if (chowCount === 4 && isNumberedSuit(pairTile)) fanTable.ALL_CHOWS = 1;
  if (fanTable.TWO_DRAGONS_PUNGS && isDragon(pairTile)) {
    fanTable.LITTLE_THREE_DRAGONS = 1;
    delete fanTable.TWO_DRAGONS_PUNGS;
  }
  if (fanTable.BIG_THREE_WINDS && isWind(pairTile)) {
    fanTable.LITTLE_FOUR_WINDS = 1;
    delete fanTable.BIG_THREE_WINDS;
  }
}

/**
 * 调整副露/顺子特征相关番种（全带幺、全带五、全双刻）。
 * @param {Object[]} melds - 面子数组
 * @param {number} pairTile - 雀头的十六进制编码
 * @param {Object} fanTable - 番表
 */
function adjustByPacksTraits(melds, pairTile, fanTable) {
  let terminal = 0, honor = 0, five = 0, even = 0;
  const all = [...melds, { type: 'PAIR', tile: pairTile }];
  for (const meld of all) {
    if (isNumberedSuit(meld.tile)) {
      const rank = getTileRank(meld.tile);
      if (meld.type === 'CHOW') {
        if (rank === 2 || rank === 8) terminal++;
        if (rank >= 4 && rank <= 6) five++;
      } else {
        if (rank === 1 || rank === 9) terminal++;
        if (rank === 5) five++;
        if (rank % 2 === 0) even++;
      }
    } else honor++;
  }
  if (terminal + honor === 5) fanTable.OUTSIDE_HAND = 1;
  else if (five === 5) fanTable.ALL_FIVE = 1;
  else if (even === 5) fanTable.ALL_EVEN_PUNGS = 1;
}

/**
 * 检查是否为独听（边张、嵌张、单钓等）。
 * 当前为简化实现，始终返回 true。
 * @param {string[]} standingTiles - 立牌数组
 * @param {string} winTile - 和牌张字符串
 * @returns {boolean}
 */
function isUniqueWaiting(standingTiles, winTile) {
  return true;
}

/**
 * 计算普通和型（4组面子 + 1对雀头）的番种。
 * @param {Object[]} melds - 面子数组
 * @param {number} pairTile - 雀头的十六进制编码
 * @param {number[]} uniqueTiles - 不重复牌的十六进制编码数组
 * @param {number[]} hexAll - 所有牌的十六进制编码数组
 * @param {number[]} counts - 牌计数数组
 * @param {Object} kongInfo - 杠的信息 (melded, concealed)
 * @param {Object} options - 计算参数
 * @param {Object} fanTable - 结果番表
 */
function calculateRegularFan(melds, pairTile, uniqueTiles, hexAll, counts, kongInfo, options, fanTable) {
  const { winTile, winFlag, seatWind, prevalentWind } = options;
  const chows = melds.filter(meld => meld.type === 'CHOW').map(meld => meld.tile);
  const pungs = melds.filter(meld => meld.type === 'PUNG' || meld.type === 'KONG').map(meld => meld.tile);
  const concealedPungs = melds.filter(meld => (meld.type === 'PUNG' || meld.type === 'KONG') && !meld.melded).length;

  // 处理刻子/杠相关的番种
  if (pungs.length > 0) {
    calculateKongs(concealedPungs, kongInfo.melded, kongInfo.concealed, fanTable);
    if (pungs.length === 4 && !fanTable.FOUR_KONGS && !fanTable.FOUR_CONCEALED_PUNGS) fanTable.ALL_PUNGS = 1;
    for (const pung of pungs) {
      const fan = get1PungFan(pung);
      if (fan) fanTable[fan] = (fanTable[fan] || 0) + 1;
    }
  }

  // 根据顺子/刻子数量分布计算对应的组合番
  if (chows.length === 4) calculate4Chows(chows.sort((a, b) => a - b), fanTable);
  else if (chows.length === 3) calculate3Chows(chows.sort((a, b) => a - b), fanTable);
  else if (chows.length === 2) {
    calculate2ChowsUnordered(chows, fanTable);
    calculate2PungsUnordered(pungs, fanTable);
  } else if (chows.length === 1) calculate3Pungs(pungs.sort((a, b) => a - b), fanTable);
  else if (chows.length === 0 && pungs.length === 4) calculate4Pungs(pungs.sort((a, b) => a - b), fanTable);

  // 基础特征调整
  adjustBySelfDrawn(melds, options.selfDrawn, fanTable);
  adjustByPairTile(pairTile, chows.length, fanTable);
  adjustByPacksTraits(melds, pairTile, fanTable);
  adjustBySuits(uniqueTiles, fanTable);
  adjustByTilesTraits(uniqueTiles, fanTable);
  adjustByRankRange(uniqueTiles, fanTable);
  if (!fanTable.QUADRUPLE_CHOW) adjustByTilesHog(counts, kongInfo.melded + kongInfo.concealed, fanTable);

  // 听牌形式检测
  if (isUniqueWaiting(options.standingTiles, options.winTile)) {
    const concealedMelds = melds.filter(meld => !meld.melded);
    const hexWin = toHexTile(options.winTile);
    if (pairTile === hexWin) fanTable.SINGLE_WAIT = 1;
    else {
      for (const meld of concealedMelds) {
        if (meld.type === 'CHOW') {
          if (meld.tile === hexWin) fanTable.CLOSED_WAIT = 1;
          else if (meld.tile + 1 === hexWin || meld.tile - 1 === hexWin) fanTable.EDGE_WAIT = 1;
        }
      }
    }
  }

  // 风牌刻子（圈风、门风）
  if (!fanTable.BIG_FOUR_WINDS) {
    pungs.forEach(pung => {
      if (isWind(pung)) {
        if (pung === 0x41 + prevalentWind) fanTable.PREVALENT_WIND = (fanTable.PREVALENT_WIND || 0) + 1;
        if (pung === 0x41 + seatWind) fanTable.SEAT_WIND = (fanTable.SEAT_WIND || 0) + 1;
      }
    });
  }

  // 和牌状态与最终原则调整
  adjustByWinFlag(winFlag, fanTable);
  finalAdjust(fanTable);
  if (Object.keys(fanTable).length === 0) fanTable.CHICKEN_HAND = 1;
}

/**
 * 国标麻将算番主入口函数。
 * @param {Object} hand - 手牌对象，包含 standingTiles 和 fixedPacks。
 * @param {Object} options - 计算参数，如 selfDrawn, prevalentWind, seatWind, flowerCount。
 * @returns {Object} 包含 ok (是否成功), totalFan (总番数), fanTable (番种详情)。
 */
export function calculateFanTable(hand, options = {}) {
  const { selfDrawn = false, prevalentWind = 0, seatWind = 0, flowerCount = 0 } = options;
  const hexStanding = hand.standingTiles.map(toHexTile);
  const hexAll = [...hexStanding, ...hand.fixedPacks.flatMap(pack => pack.tiles.map(toHexTile))];

  // 校验张数
  if (hexAll.length !== 14) return { ok: false, totalFan: -1, fanTable: {} };

  const uniqueTiles = Array.from(new Set(hexAll));
  const counts = Array(0x59).fill(0);
  hexAll.forEach(tile => counts[tile]++);

  let winTile = hand.standingTiles[hand.standingTiles.length - 1]; // 假设最后一张为和牌张
  let winFlag = (selfDrawn ? 1 : 0);

  let bestFanTable = {};
  let maxFan = -1;

  // 1. 尝试检测特殊和型（不需要拆解面子）
  if (hand.fixedPacks.length === 0) {
    const specialTable = {};
    if (calculateSpecialFormFan(counts, hexAll, uniqueTiles, toHexTile(winTile), seatWind, winFlag, specialTable)) {
      bestFanTable = specialTable;
      maxFan = Object.entries(bestFanTable).reduce((sum, [key, value]) => sum + (FAN_VALUE[key] || 0) * value, 0);
    }
  }

  // 2. 递归拆解手牌，计算普通和型的所有可能组合，并取高点
  const decompositions = findDecompositions(hand.standingTiles);
  for (const decomposition of decompositions) {
    const currentTable = {};
    const melds = decomposition.melds.map(meld => ({ type: meld.type, tile: toHexTile(meld.tile), melded: false }));
    const kongInfo = { melded: 0, concealed: 0 };

    // 合并副露信息
    hand.fixedPacks.forEach(pack => {
      const type = pack.tiles.length === 4 ? 'KONG' : (pack.tiles[0] === pack.tiles[1] ? 'PUNG' : 'CHOW');
      melds.push({ type, tile: toHexTile(pack.tiles[1]), melded: true });
      if (type === 'KONG') kongInfo.melded++;
    });

    calculateRegularFan(melds, toHexTile(decomposition.pair), uniqueTiles, hexAll, counts, kongInfo, { ...options, winTile, winFlag, standingTiles: hand.standingTiles }, currentTable);
    const currentFan = Object.entries(currentTable).reduce((sum, [key, value]) => sum + (FAN_VALUE[key] || 0) * value, 0);
    if (currentFan > maxFan) {
      maxFan = currentFan;
      bestFanTable = currentTable;
    }
  }

  // 未能构成任何和型
  if (maxFan === -1) return { ok: false, totalFan: -3, fanTable: {} };

  // 3. 最后加上花牌番数
  bestFanTable.FLOWER_TILES = flowerCount;
  const totalFan = Object.entries(bestFanTable).reduce((sum, [key, value]) => sum + (FAN_VALUE[key] || 0) * value, 0);
  return { ok: true, totalFan, fanTable: bestFanTable };
}
