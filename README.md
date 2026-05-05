# mahjong-algorithm-gb JavaScript

基于 C++ 版本的国标麻将（GB/T 15364-1998）算番算法移植。

## 快速开始

```javascript
import { calculateFan } from './src/index.js';

const hand = '[123m][456m]789m111s22p';
const options = {
  selfDrawn: true,
  flowerCount: 8,
  prevalentWind: 0, // 东
  seatWind: 0       // 东
};

const result = calculateFan(hand, options);
console.log(result.totalFan); // 总番数
```

## 参数说明

### 1. 手牌字符串 (`hand`)
手牌由**副露**和**立牌**组成。总张数应为 14 张（包括和牌张）。

#### 牌的表示：
- **序数牌**：数字 + 花色后缀
  - `m`：万 (Characters)，如 `123m`
  - `s`：条 (Bamboos)，如 `456s`
  - `p`：饼 (Dots)，如 `789p`
- **字牌**：直接使用大写字母
  - `E, S, W, N`：东、南、西、北
  - `C, F, P`：中、发、白

#### 副露 (Fixed Packs)：
使用方括号 `[]` 包裹。
- **吃**：`[123m]`
- **碰**：`[111m]`
- **杠**：`[1111m]`
- **供牌位置**（可选）：使用逗号分隔，如 `[123m,1]`。`1, 2, 3` 分别代表下家、对家、上家。

#### 示例：
- 门清手牌：`123m456s789pESWNCF` (和牌张为最后一位)
- 带副露手牌：`[123m][111s]456s789pEE`

---

### 2. 计算选项 (`options`)
`calculateFan` 的第二个参数为一个对象，支持以下属性：

| 属性 | 说明 | 类型 | 默认值 |
| :--- | :--- | :--- | :--- |
| `selfDrawn` | 是否为自摸 | `boolean` | `false` |
| `flowerCount` | 花牌数量 | `number` | `0` |
| `prevalentWind`| 圈风 (0:东, 1:南, 2:西, 3:北) | `number` | `0` |
| `seatWind` | 门风 (0:东, 1:南, 2:西, 3:北) | `number` | `0` |

---

## 已实现番种
当前已实现 81 种国标番种的绝大部分，包括但不限于：
- **88番**：大四喜、大三元、绿一色、九莲宝灯、四杠、连七对、十三幺
- **24番**：七对、清一色、全双刻等
- **基础番**：平胡、断幺、自摸、花牌等

## 开发计划
1. 补齐所有 81 种番种逻辑。
2. 完善听牌形式（边、嵌、钓）的自动检测。
3. 增加更多对拍测试用例，确保与 C++ 版本逻辑完全一致。
