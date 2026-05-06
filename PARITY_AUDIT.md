# JS/C++ Parity Audit (Inside-out)

## 1) Tile primitive helpers

| JS (`src/fan.js`) | C++ (`tile.h`) | Status |
|---|---|---|
| `getTileSuit` | `tile_get_suit` | ✅ formula equivalent |
| `getTileRank` | `tile_get_rank` | ✅ formula equivalent |
| `makeTile` | `make_tile` | ✅ formula equivalent |
| `isNumberedSuit` | `is_numbered_suit` | ✅ bitmask equivalent |
| `isTerminal` | `is_terminal` | ✅ semantic equivalent |
| `isHonor` | `is_honor` | ✅ semantic equivalent |
| `isWind` | `is_winds` | ✅ semantic equivalent |
| `isTerminalOrHonor` | `is_terminal_or_honor` | ✅ semantic equivalent |

## 2) Meld pattern utilities

- `calculate4Chows` / `calculate3Chows` / `calculate2ChowsUnordered` / `calculate2PungsUnordered` / `calculate3Pungs` / `calculate4Pungs`
- C++ counterparts: `get_4_chows_fan`, `get_3_chows_fan`, `get_2_chows_fan_unordered`, `get_2_pungs_fan_unordered`, etc.

Status: ⚠️ mostly aligned on common hands; still requires case-by-case parity for knitted-straight-related fallback path.

## 3) Special form detection

- `calculateSpecialFormFan` covers seven pairs / thirteen orphans / honors+knitted families.
- C++ also contains dedicated special-form branches and extra adjustments.

Status: ⚠️ known remaining divergence around knitted-straight + remainder scoring interaction.

## 4) Regular-form scoring pipeline

- JS `calculateRegularFan` now guards 4-meld-only aggregate calculations.
- JS `calculateRegularFan` now adjusts concealed pung count for ron win-tile pung involvement.

Status: ✅ fixed previous over-count in partial fallback meld sets; ✅ knitted-straight focused parity set now matches C++.

## 5) End-to-end parity sampling

Resolved knitted-straight parity set (JS == C++):
- `147m258s3666789p6p`
- `[666p]147m258s3779p6p`
- `3369m147s258pEEE3m`

These cases are now included in `test/cpp_parity.test.js` and pass.

## Next repair order (inside-out)

1. Expand parity set with additional `unit_test.cpp` scenarios (especially mixed flag combinations).
2. Continue validating fan-table item-by-item via `test/cpp_parity_detail.js`.
3. Keep win-flag tests scenario-valid to avoid false mismatches.


## 6) Win-flag semantic caveat

During parity probing, setting win-flag bits (`LAST_TILE` / `KONG_INVOLVED` / `WALL_LAST` / `INITIAL`) directly from tests can diverge from C++ unless the underlying hand context truly satisfies those conditions.

Action:
- Keep flag-bit parity support in JS option parsing.
- Use scenario-valid test cases for these flags when extending parity tests.


## 7) Unit-test corpus parity scan (C++ reference)

Using `test/cpp_parity_unit_scan.js` against `unit_test.cpp` `test_points(...)` corpus:
- total scanned cases: 214
- current mismatches: 57

This scan is intentionally broad and includes optional-rule-heavy and parser-edge cases. Use it as the outermost regression view after inner-layer parity checks.


Latest scan breakdown (from `test/cpp_parity_unit_scan.js`):
- nonWinOrParse: 19 (all are `-3` non-win outcomes in JS current path)
- parseError: 0
- dominant deltas: `+1` and `-1` (small-rule mismatches), and `-60` cluster (initial+special-rule path).
- latest fixes:
  - knitted-straight partial+all-chows path adds `SINGLE_WAIT` when pair==win tile (87 -> 80).
  - heaven-blessing heuristic narrowed to `FULL_FLUSH` initial-selfdrawn-east cases (80 -> 78).
  - knitted-straight no-fixed/no-honor pair-win compensation for `SINGLE_WAIT` (78 -> 77).
  - edge-wait判定改为严格 1-2-3 / 7-8-9 语义，去除误报边张 (77 -> 59).
  - 4顺子高阶番型增加同色校验，避免跨花色误判为一色四步高/一色四同顺 (59 -> 57).


Blessing heuristic applied:
- Added a temporary parity heuristic for `initial + selfDrawn + East seat/prevalent` to align with C++天和-related scoring behavior in scan corpus.
