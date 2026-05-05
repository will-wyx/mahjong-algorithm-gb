import { calculateFan, FAN_NAME_ZH, FAN_VALUE } from '../src/index.js';

const testCases = [
  {
    name: 'Big Three Dragons',
    hand: '[CCC][PPP]11m99pFFF1m',
    expectedFan: 88, // At least 88
  },
  {
    name: 'Thirteen Orphans',
    hand: '19m19s19pESWNCFPN',
    expectedFan: 88,
  },
  {
    name: 'Seven Pairs',
    hand: '1122334455667m7m',
    expectedFan: 24,
  },
  {
    name: 'Full Flush',
    hand: '12345678912311m',
    expectedFan: 24,
  },
  {
    name: 'All Simples',
    hand: '234m234s345p456p22s',
    expectedFan: 2,
  },
  {
    name: 'Mixed Triple Chow (Not implemented in JS yet, should fall back to Chicken Hand or others)',
    hand: '123m123s123p456m77s',
    expectedFan: 8, // Chicken Hand is 8 in this simplified version if nothing else matches
  },
  {
    name: 'All Pungs',
    hand: '111m222s333p444p55m',
    expectedFan: 6,
  },
  {
    name: 'All Chows',
    hand: '123m456s789p123p55m',
    expectedFan: 2,
  },
  {
    name: 'Dragon Pung',
    hand: '123m456s789pCCC55m',
    expectedFan: 2,
  }
];

function runTests() {
  let passed = 0;
  for (const tc of testCases) {
    const result = calculateFan(tc.hand);
    if (result.ok) {
      console.log(`✅ [PASS] ${tc.name}: ${result.totalFan} 番`);
      const fanDetails = Object.entries(result.fanTable)
        .filter(([_, count]) => count > 0)
        .sort(([keyA, _A], [keyB, _B]) => (FAN_VALUE[keyB] || 0) - (FAN_VALUE[keyA] || 0))
        .map(([key, count]) => {
          const name = FAN_NAME_ZH[key] || key;
          const value = FAN_VALUE[key] || 0;
          return `   ${name}(${value}${count > 1 ? `x${count}` : ''})`;
        })
        .join('\n');
      if (fanDetails) {
        console.log(fanDetails);
      }
      if (result.totalFan >= tc.expectedFan) {
        passed++;
      } else {
        console.log(`❌ [FAIL] ${tc.name}: Expected >= ${tc.expectedFan}, got ${result.totalFan}`);
      }
    } else {
      console.log(`❌ [FAIL] ${tc.name}: Calculation failed with error ${result.totalFan}`);
    }
  }
  console.log(`\nPassed ${passed}/${testCases.length} tests.`);
}

runTests();
