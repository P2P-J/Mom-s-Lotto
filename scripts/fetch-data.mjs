// 동행복권 1~최신 회차 데이터를 GitHub 미러에서 가져와 src/data/draws.json 으로 저장
//
// 1차: hjleesm/lottery-data (https://github.com/hjleesm/lottery-data)
//   - 동행복권 공식 API 미러, JSON 단일 파일, 최근까지 자동 업데이트
//   - 형식: { lastUpdated, rounds: [{round, date, numbers:[6], bonus}] }
//
// 2차 폴백: 동행복권 공식 API (현재 사이트 점검중이라 대부분 실패하지만 새 회차가 풀리면 정상화됨)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'draws.json');

const MIRROR_URL =
  'https://raw.githubusercontent.com/hjleesm/lottery-data/main/latest.json';
const DH_API =
  'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';

// 알려진 데이터 오류 — 일부 미러에 1070/1071이 스왑되어 있어 제3 미러로 정답 확정함
const KNOWN_FIXES = {
  // round: { numbers: [...sorted], bonus: n }
  // (현재 hjleesm 데이터는 정답이라 보정 불필요. 향후 다른 소스 사용 시 대비)
};

function validateRound(r) {
  if (!Number.isInteger(r.round) || r.round < 1) return '회차 오류';
  if (!Array.isArray(r.numbers) || r.numbers.length !== 6) return '번호 개수';
  const set = new Set(r.numbers);
  if (set.size !== 6) return '중복';
  for (const n of r.numbers) {
    if (!Number.isInteger(n) || n < 1 || n > 45) return `범위 ${n}`;
  }
  if (!Number.isInteger(r.bonus) || r.bonus < 1 || r.bonus > 45)
    return '보너스 범위';
  if (set.has(r.bonus)) return '보너스 중복';
  return null;
}

function normalizeDate(s) {
  // "2025.12.27 " / "2025-12-27" / "2002.12.7" → "YYYY-MM-DD"
  const t = String(s).trim().replace(/\./g, '-');
  const [y, m, d] = t.split('-');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const FETCH_TIMEOUT_MS = 10_000;

function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function fetchMirror() {
  const res = await fetchWithTimeout(MIRROR_URL);
  if (!res.ok) throw new Error(`Mirror HTTP ${res.status}`);
  const data = await res.json();
  return data.rounds.map((r) => ({
    round: r.round,
    date: normalizeDate(r.date),
    numbers: [...r.numbers].sort((a, b) => a - b),
    bonus: r.bonus,
  }));
}

async function fetchDhRound(round) {
  let res;
  try {
    res = await fetchWithTimeout(`${DH_API}${round}`, { redirect: 'manual' });
  } catch {
    return null; // 타임아웃/네트워크 실패 시 조용히 폴백
  }
  if (res.status !== 200) return null;
  const ctype = res.headers.get('content-type') || '';
  if (!ctype.includes('json')) return null;
  const j = await res.json();
  if (j.returnValue !== 'success') return null;
  return {
    round: j.drwNo,
    date: normalizeDate(j.drwNoDate),
    numbers: [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6].sort((a, b) => a - b),
    bonus: j.bnusNo,
  };
}

async function main() {
  console.log('[fetch] GitHub 미러에서 다운로드...');
  let rounds = await fetchMirror();
  rounds.sort((a, b) => a.round - b.round);
  console.log(`[fetch] 미러: ${rounds.length}개 회차 (${rounds[0].round} ~ ${rounds[rounds.length - 1].round})`);

  // 동행복권 공식 API로 누락 회차 보충 시도
  const have = new Set(rounds.map((r) => r.round));
  const latest = rounds[rounds.length - 1].round;
  let added = 0;
  for (let r = latest + 1; r <= latest + 10; r++) {
    if (have.has(r)) continue;
    const fetched = await fetchDhRound(r);
    if (!fetched) break;
    rounds.push(fetched);
    have.add(r);
    added++;
  }
  if (added) {
    console.log(`[fetch] 동행복권 공식 API에서 +${added}회 추가`);
    rounds.sort((a, b) => a.round - b.round);
  } else {
    console.log('[fetch] 동행복권 공식 API 응답 없음 (사이트 점검 가능성)');
  }

  // 알려진 보정 적용
  for (const r of rounds) {
    const fix = KNOWN_FIXES[r.round];
    if (fix) Object.assign(r, fix);
  }

  // 검증
  const errors = [];
  for (const r of rounds) {
    const err = validateRound(r);
    if (err) errors.push(`${r.round}: ${err}`);
  }
  if (errors.length) {
    console.error('[fetch] 검증 실패:', errors);
    process.exit(1);
  }

  // 연속 회차 검증
  for (let i = 1; i < rounds.length; i++) {
    if (rounds[i].round !== rounds[i - 1].round + 1) {
      console.error(`[fetch] 회차 누락: ${rounds[i - 1].round} → ${rounds[i].round}`);
      process.exit(1);
    }
  }

  const out = {
    source: 'https://github.com/hjleesm/lottery-data (동행복권 공식 API 미러)',
    fetchedAt: new Date().toISOString(),
    totalRounds: rounds.length,
    firstRound: rounds[0],
    lastRound: rounds[rounds.length - 1],
    rounds,
  };

  await fs.writeFile(OUT, JSON.stringify(out) + '\n', 'utf8');
  const size = (await fs.stat(OUT)).size;
  console.log(`[fetch] 저장: ${path.relative(ROOT, OUT)} (${(size / 1024).toFixed(1)} KB)`);
  console.log(`[fetch] 범위: 1회 (${out.firstRound.date}) ~ ${out.lastRound.round}회 (${out.lastRound.date})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
