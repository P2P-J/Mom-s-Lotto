import { LOTTERY_FREQUENCY, RECENT_TRENDS } from "../data/lotteryFrequency.js";

/**
 * 배열에서 랜덤 요소 선택
 */
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 가중치 기반 랜덤 선택
 */
function weightedRandom(weights) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (const [num, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return parseInt(num);
    }
  }

  return parseInt(Object.keys(weights)[0]);
}

/**
 * 스마트 추천: 빈도 데이터 + 최근 트렌드 기반
 */
function generateSmart() {
  const numbers = new Set();
  const weights = { ...LOTTERY_FREQUENCY };

  // 최근 트렌드에 가중치 추가 (+30)
  RECENT_TRENDS.forEach((num) => {
    if (weights[num]) {
      weights[num] += 30;
    }
  });

  // 6개 번호 선택
  while (numbers.size < 6) {
    const num = weightedRandom(weights);
    numbers.add(num);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * 균형 조합: 5개 구간에서 고르게 분산
 */
function generateBalanced() {
  const zones = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9], // 1-9
    [10, 11, 12, 13, 14, 15, 16, 17, 18], // 10-18
    [19, 20, 21, 22, 23, 24, 25, 26, 27], // 19-27
    [28, 29, 30, 31, 32, 33, 34, 35, 36], // 28-36
    [37, 38, 39, 40, 41, 42, 43, 44, 45], // 37-45
  ];

  const numbers = new Set();
  const usedZones = new Set();

  // 최소 4개 구간에서 선택
  while (numbers.size < 6) {
    let zoneIndex;

    if (usedZones.size < 4) {
      // 아직 4개 구간을 사용하지 않았다면 새로운 구간 선택
      do {
        zoneIndex = Math.floor(Math.random() * 5);
      } while (usedZones.has(zoneIndex) && usedZones.size < 4);
    } else {
      // 4개 구간 이상 사용했다면 아무 구간에서나 선택 가능
      zoneIndex = Math.floor(Math.random() * 5);
    }

    const zone = zones[zoneIndex];
    const num = getRandomElement(zone);

    if (!numbers.has(num)) {
      numbers.add(num);
      usedZones.add(zoneIndex);
    }
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * 완전 랜덤: 순수 무작위
 */
function generateRandom() {
  const numbers = new Set();

  while (numbers.size < 6) {
    const num = Math.floor(Math.random() * 45) + 1;
    numbers.add(num);
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * 보너스 번호 생성 (메인 번호와 중복되지 않음)
 */
function generateBonus(mainNumbers) {
  let bonus;
  do {
    bonus = Math.floor(Math.random() * 45) + 1;
  } while (mainNumbers.includes(bonus));

  return bonus;
}

/**
 * 메인 함수: 선택된 방식에 따라 번호 생성
 */
export function generateNumbers(method = "smart") {
  let numbers;

  switch (method) {
    case "smart":
      numbers = generateSmart();
      break;
    case "balanced":
      numbers = generateBalanced();
      break;
    case "random":
      numbers = generateRandom();
      break;
    default:
      numbers = generateSmart();
  }

  const bonus = generateBonus(numbers);

  return {
    numbers,
    bonus,
  };
}
