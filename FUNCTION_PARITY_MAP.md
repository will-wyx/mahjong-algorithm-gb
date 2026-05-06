# JS ↔ C++ Function Parity Map (Inside-out)

## Layer 1: Tile primitives

| JS function | C++ function | Verification |
|---|---|---|
| `getTileSuit` | `tile_get_suit` | `test/tile_primitive_parity.test.js` |
| `getTileRank` | `tile_get_rank` | `test/tile_primitive_parity.test.js` |
| `isNumberedSuit` | `is_numbered_suit` | `test/tile_primitive_parity.test.js` (valid tile domain) |
| `isTerminal` | `is_terminal` | `test/tile_primitive_parity.test.js` |
| `isHonor` | `is_honor` | `test/tile_primitive_parity.test.js` |
| `isWind` | `is_winds` | `test/tile_primitive_parity.test.js` |
| `isTerminalOrHonor` | `is_terminal_or_honor` | `test/tile_primitive_parity.test.js` |

## Layer 2: Fan pipeline building blocks

| JS function | C++ counterpart area | Status |
|---|---|---|
| `adjustBySelfDrawn` | regular flow: 自摸/门清/不求人分支 | parity-covered by end-to-end cases |
| `calculateKongs` | 杠/暗刻统计分支 | parity-covered by end-to-end cases |
| `adjustBySuits` | 花色番种分支 | parity-covered by end-to-end cases |
| `adjustByTilesTraits` | 牌型特性分支 | parity-covered by end-to-end cases |
| `adjustByRankRange` | 数值范围分支 | parity-covered by end-to-end cases |
| `adjustByWinFlag` | `WIN_FLAG_*` 相关分支 | parity-covered; scenario-valid flags only |

## Layer 3: Special forms and fallback

| JS function | C++ counterpart area | Status |
|---|---|---|
| `calculateSpecialFormFan` | 特殊和型（七对/十三幺/不靠） | parity-covered by curated cases |
| `getKnittedStraightCandidate` + fallback | 组合龙路径 | parity-covered by knitted-straight focused cases |

## Layer 4: Top-level end-to-end

| JS entry | C++ entry | Verification |
|---|---|---|
| `calculateFan` / `calculateFanTable` | `calculate_fan` | `test/cpp_parity.test.js` |

## Execution order for parity checks

1. `node test/tile_primitive_parity.test.js`
2. `node test/cpp_parity.test.js`
3. `node test/cpp_parity_detail.js` (for mismatch triage)

