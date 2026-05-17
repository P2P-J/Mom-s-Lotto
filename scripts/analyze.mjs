// draws.json 을 분석하여 빌드타임 통계 산출물 src/data/stats.json 을 생성한다.
//
// 산출 항목
//   - frequency.main[1..45]:     메인 번호 출현 횟수 (보너스 제외)
//   - frequency.all[1..45]:      메인+보너스 합산 출현 횟수
//   - frequency.recent[1..45]:   최근 50회 메인 번호 출현 횟수
//   - top10 / bottom10:          메인 빈도 기준 상/하위 10
//   - oddEvenDistribution:       {6:0, 5:1, 4:2, 3:3, 2:4, 1:5, 0:6 → 회차수}
//   - zoneDistribution:          각 회차의 5구간 카운트의 평균 [z1..z5]
//   - consecutiveDistribution:   회차당 연속쌍 개수의 분포 {0,1,2,3,4,5}
//   - sumStats:                  {min, max, mean, std, median, p25, p75}
//   - pairFrequency:             동시 출현 페어 Top 20
//   - recentTrend:               최근 50회 가장 자주 나온 번호 Top 10

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IN = path.join(ROOT, 'src', 'data', 'draws.json');
const OUT = path.join(ROOT, 'src', 'data', 'stats.json');

const RECENT_N = 50;
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

function mean(arr) {
  return arr.length ? sum(arr) / arr.length : 0;
}

function std(arr) {
  if (!arr.length) return 0;
  const m = mean(arr);
  return Math.sqrt(mean(arr.map((x) => (x - m) ** 2)));
}

function percentile(sortedArr, p) {
  if (!sortedArr.length) return 0;
  const idx = (sortedArr.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * (idx - lo);
}

function countConsecutive(nums) {
  let c = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i + 1] - nums[i] === 1) c++;
  }
  return c;
}

function main() {
  return fs
    .readFile(IN, 'utf8')
    .then((raw) => {
      const data = JSON.parse(raw);
      const rounds = data.rounds;
      const total = rounds.length;

      // 빈도
      const freqMain = Array(46).fill(0);
      const freqAll = Array(46).fill(0);
      for (const r of rounds) {
        for (const n of r.numbers) {
          freqMain[n]++;
          freqAll[n]++;
        }
        freqAll[r.bonus]++;
      }

      // 최근 50회
      const recentRounds = rounds.slice(-RECENT_N);
      const freqRecent = Array(46).fill(0);
      for (const r of recentRounds) {
        for (const n of r.numbers) freqRecent[n]++;
      }

      // 빈도 랭킹
      const ranked = [];
      for (let n = 1; n <= 45; n++) ranked.push({ number: n, count: freqMain[n] });
      ranked.sort((a, b) => b.count - a.count || a.number - b.number);

      const recentRanked = [];
      for (let n = 1; n <= 45; n++)
        recentRanked.push({ number: n, count: freqRecent[n] });
      recentRanked.sort((a, b) => b.count - a.count || a.number - b.number);

      // 홀짝 분포
      const oddEven = { '6:0': 0, '5:1': 0, '4:2': 0, '3:3': 0, '2:4': 0, '1:5': 0, '0:6': 0 };
      for (const r of rounds) {
        const odd = r.numbers.filter((n) => n % 2 === 1).length;
        oddEven[`${odd}:${6 - odd}`]++;
      }

      // 구간 분포
      const zoneSums = [0, 0, 0, 0, 0];
      const zoneCountPerRound = []; // 각 회차의 [z1..z5]
      for (const r of rounds) {
        const z = [0, 0, 0, 0, 0];
        for (const n of r.numbers) z[zoneOf(n)]++;
        zoneCountPerRound.push(z);
        for (let i = 0; i < 5; i++) zoneSums[i] += z[i];
      }
      const zoneAvg = zoneSums.map((s) => +(s / total).toFixed(3));

      // 활용된 구간 수 분포 (몇 개 구간에서 뽑혔는가)
      const usedZonesDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const z of zoneCountPerRound) {
        const used = z.filter((x) => x > 0).length;
        usedZonesDist[used]++;
      }

      // 연속쌍 분포
      const consecutiveDist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of rounds) {
        const c = countConsecutive(r.numbers);
        consecutiveDist[c] = (consecutiveDist[c] || 0) + 1;
      }

      // 합계 통계
      const sums = rounds.map((r) => sum(r.numbers));
      const sumsSorted = [...sums].sort((a, b) => a - b);
      const sumStats = {
        min: sumsSorted[0],
        max: sumsSorted[sumsSorted.length - 1],
        mean: +mean(sums).toFixed(2),
        std: +std(sums).toFixed(2),
        median: percentile(sumsSorted, 0.5),
        p25: percentile(sumsSorted, 0.25),
        p75: percentile(sumsSorted, 0.75),
      };

      // 페어 빈도
      const pairCounts = new Map();
      for (const r of rounds) {
        const nums = r.numbers;
        for (let i = 0; i < nums.length; i++) {
          for (let j = i + 1; j < nums.length; j++) {
            const key = `${nums[i]}-${nums[j]}`;
            pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
          }
        }
      }
      const pairTop = [...pairCounts.entries()]
        .map(([k, v]) => {
          const [a, b] = k.split('-').map(Number);
          return { pair: [a, b], count: v };
        })
        .sort((x, y) => y.count - x.count)
        .slice(0, 20);

      const out = {
        generatedAt: new Date().toISOString(),
        source: data.source,
        totalRounds: total,
        firstRound: data.firstRound,
        lastRound: data.lastRound,
        recentWindowSize: RECENT_N,

        frequency: {
          main: freqMain.slice(1), // index 0 = number 1
          all: freqAll.slice(1),
          recent: freqRecent.slice(1),
        },

        top10: ranked.slice(0, 10),
        bottom10: ranked.slice(-10).reverse(),
        recentTop10: recentRanked.slice(0, 10),

        oddEvenDistribution: oddEven,
        zoneAvgPerRound: zoneAvg,
        usedZonesDistribution: usedZonesDist,
        consecutiveDistribution: consecutiveDist,
        sumStats,
        pairTop20: pairTop,
      };

      return fs.writeFile(OUT, JSON.stringify(out) + '\n', 'utf8').then(() => out);
    })
    .then((out) => {
      console.log(`[analyze] 회차: ${out.totalRounds} (${out.firstRound.date} ~ ${out.lastRound.date})`);
      console.log(`[analyze] Top 5:`, out.top10.slice(0, 5).map((x) => `${x.number}(${x.count})`).join(' '));
      console.log(`[analyze] Bottom 5:`, out.bottom10.slice(0, 5).map((x) => `${x.number}(${x.count})`).join(' '));
      console.log(`[analyze] 최근 50회 Top 5:`, out.recentTop10.slice(0, 5).map((x) => `${x.number}(${x.count})`).join(' '));
      console.log(`[analyze] 홀짝 분포:`, out.oddEvenDistribution);
      console.log(`[analyze] 연속쌍 분포:`, out.consecutiveDistribution);
      console.log(`[analyze] 합계: 평균 ${out.sumStats.mean}, 표준편차 ${out.sumStats.std}, [${out.sumStats.min}~${out.sumStats.max}]`);
      console.log(`[analyze] 활용 구간 수 분포:`, out.usedZonesDistribution);
      console.log(`[analyze] 페어 Top 3:`, out.pairTop20.slice(0, 3).map((p) => `${p.pair.join('-')}(${p.count})`).join(' '));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

main();
