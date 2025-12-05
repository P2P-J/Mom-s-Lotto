/**
 * 생성된 로또 번호의 통계 계산
 */
export function calculateStatistics(numbers) {
  if (!numbers || numbers.length !== 6) {
    return null;
  }

  // 합계
  const sum = numbers.reduce((acc, num) => acc + num, 0);

  // 평균 (소수점 첫째자리)
  const avg = (sum / 6).toFixed(1);

  // 홀수/짝수 개수
  let oddCount = 0;
  let evenCount = 0;
  numbers.forEach((num) => {
    if (num % 2 === 0) {
      evenCount++;
    } else {
      oddCount++;
    }
  });

  // 연속 번호 개수 (차이가 1인 인접 번호)
  let consecutive = 0;
  for (let i = 0; i < numbers.length - 1; i++) {
    if (numbers[i + 1] - numbers[i] === 1) {
      consecutive++;
    }
  }

  return {
    sum,
    avg,
    oddCount,
    evenCount,
    consecutive,
  };
}
