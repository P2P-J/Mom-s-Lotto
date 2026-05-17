import stats from "../data/stats.json";

// 통계: stats.frequency.main[0]은 번호 1, stats.frequency.main[44]는 번호 45
const FREQ_MAIN = stats.frequency.main;
const FREQ_RECENT = stats.frequency.recent;

const ZONES = [
  [1, 9],
  [10, 18],
  [19, 27],
  [28, 36],
  [37, 45],
];

function zoneOf(n) {
  return ZONES.findIndex(([lo, hi]) => n >= lo && n <= hi);
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function countConsecutive(sortedNums) {
  let c = 0;
  for (let i = 0; i < sortedNums.length - 1; i++) {
    if (sortedNums[i + 1] - sortedNums[i] === 1) c++;
  }
  return c;
}

function weightedPick(weights, exclude) {
  let total = 0;
  for (let i = 0; i < 45; i++) {
    if (!exclude.has(i + 1)) total += weights[i];
  }
  let r = Math.random() * total;
  for (let i = 0; i < 45; i++) {
    const n = i + 1;
    if (exclude.has(n)) continue;
    r -= weights[i];
    if (r <= 0) return n;
  }
  // 부동소수점 누적 오차 대비: 가능한 후보 중 균등 선택 (작은 번호 편향 방지)
  const candidates = [];
  for (let n = 1; n <= 45; n++) {
    if (!exclude.has(n) && weights[n - 1] > 0) candidates.push(n);
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function drawSix(weights) {
  const picked = new Set();
  while (picked.size < 6) picked.add(weightedPick(weights, picked));
  return [...picked].sort((a, b) => a - b);
}

// 🔥 Hot: 전체 빈도 + 최근 50회 트렌드 보너스
function generateHot() {
  // 베이스 가중치 = 전체 빈도 (133~182 범위)
  // 최근 50회 출현 수 × 8 만큼 추가 가중 (최근 핫넘버에 강한 부스트)
  const w = FREQ_MAIN.map((f, i) => f + FREQ_RECENT[i] * 8);
  return drawSix(w);
}

// ❄️ Cold: 빈도 역가중 (오래 안 나온 번호 우대)
function generateCold() {
  const maxF = Math.max(...FREQ_MAIN);
  // (max - freq + 30): 빈도 낮을수록 큰 값. +30 offset으로 최저번호도 완전 제외 방지
  const w = FREQ_MAIN.map((f) => maxF - f + 30);
  return drawSix(w);
}

// ⚖️ Balanced: 실제 1222회 분포에 통계적으로 부합하도록 재추첨
//
// 조건 (실제 데이터 분포의 ~85% 영역 커버):
//   - 5구간 중 4개 이상 사용 (실제 약 68%)
//   - 홀짝 비율 2:4 ~ 4:2 (실제 82%)
//   - 합계 105 ~ 175 (1σ 영역, 실제 약 75%)
//   - 연속쌍 0~2 (실제 약 98%)
function isBalanced(nums) {
  const usedZones = new Set(nums.map(zoneOf)).size;
  if (usedZones < 4) return false;
  const odd = nums.filter((n) => n % 2 === 1).length;
  if (odd < 2 || odd > 4) return false;
  const s = sum(nums);
  if (s < 105 || s > 175) return false;
  if (countConsecutive(nums) > 2) return false;
  return true;
}

function generateBalanced() {
  // 균등 가중치로 뽑되, 조건 만족까지 최대 200회 재시도
  const uniformW = new Array(45).fill(1);
  for (let attempt = 0; attempt < 200; attempt++) {
    const nums = drawSix(uniformW);
    if (isBalanced(nums)) return nums;
  }
  // 200회 모두 실패하면 마지막 시도 반환 (확률상 거의 발생 안 함)
  return drawSix(uniformW);
}

// 🎲 Random: 순수 무작위
function generateRandom() {
  const uniformW = new Array(45).fill(1);
  return drawSix(uniformW);
}

function generateBonus(mainNumbers) {
  const exclude = new Set(mainNumbers);
  let n;
  do {
    n = Math.floor(Math.random() * 45) + 1;
  } while (exclude.has(n));
  return n;
}

export function generateNumbers(method = "hot") {
  let numbers;
  switch (method) {
    case "hot":
      numbers = generateHot();
      break;
    case "cold":
      numbers = generateCold();
      break;
    case "balanced":
      numbers = generateBalanced();
      break;
    case "random":
      numbers = generateRandom();
      break;
    default:
      numbers = generateHot();
  }
  return { numbers, bonus: generateBonus(numbers) };
}

export const METHODS = [
  {
    id: "hot",
    icon: "🔥",
    title: "핫 추천",
    description: "전체 출현 빈도 + 최근 50회 트렌드 가중",
  },
  {
    id: "cold",
    icon: "❄️",
    title: "콜드 역발상",
    description: "오래 안 나온 번호에 더 큰 가중치",
  },
  {
    id: "balanced",
    icon: "⚖️",
    title: "균형 조합",
    description: "실제 당첨 분포(구간·홀짝·합계) 매칭",
  },
  {
    id: "random",
    icon: "🎲",
    title: "완전 랜덤",
    description: "순수 무작위 (가장 공정)",
  },
];
