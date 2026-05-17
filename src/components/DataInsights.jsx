import { useState } from "react";
import stats from "../data/stats.json";
import { getNumberColor } from "../utils/colors";

function Ball({ n, count, sub }) {
  return (
    <div className="insight-ball" style={{ backgroundColor: getNumberColor(n) }}>
      <span className="insight-ball-num">{n}</span>
      <span className="insight-ball-count">{count}회</span>
      {sub && <span className="insight-ball-sub">{sub}</span>}
    </div>
  );
}

export default function DataInsights() {
  const [open, setOpen] = useState(false);

  const { top10, bottom10, recentTop10, sumStats, oddEvenDistribution } = stats;
  const total = stats.totalRounds;
  const dist = oddEvenDistribution;
  const mostCommonOE = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];
  const oePct = ((mostCommonOE[1] / total) * 100).toFixed(1);

  return (
    <section className="data-insights">
      <button
        className="insights-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="insights-toggle-icon">📊</span>
        <span className="insights-toggle-text">
          실제 당첨 데이터 분석 (1~{stats.lastRound.round}회)
        </span>
        <span className="insights-toggle-arrow">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="insights-body">
          <p className="insights-meta">
            기간 {stats.firstRound.date} ~ {stats.lastRound.date} · 총{" "}
            {total.toLocaleString()}회 ·{" "}
            <a
              href={stats.source.match(/https?:\/\/\S+/)?.[0] || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              데이터 출처
            </a>
          </p>

          <div className="insights-grid">
            <div className="insights-card">
              <h4>🔥 가장 많이 나온 Top 5</h4>
              <div className="ball-row">
                {top10.slice(0, 5).map((b) => (
                  <Ball key={b.number} n={b.number} count={b.count} />
                ))}
              </div>
            </div>

            <div className="insights-card">
              <h4>❄️ 가장 적게 나온 Bottom 5</h4>
              <div className="ball-row">
                {bottom10.slice(0, 5).map((b) => (
                  <Ball key={b.number} n={b.number} count={b.count} />
                ))}
              </div>
            </div>

            <div className="insights-card">
              <h4>📈 최근 50회 핫넘버 Top 5</h4>
              <div className="ball-row">
                {recentTop10.slice(0, 5).map((b) => (
                  <Ball key={b.number} n={b.number} count={b.count} sub="/50" />
                ))}
              </div>
            </div>

            <div className="insights-card">
              <h4>📐 합계 분포</h4>
              <p className="insights-line">
                평균 <strong>{sumStats.mean}</strong> · 표준편차{" "}
                <strong>{sumStats.std}</strong>
              </p>
              <p className="insights-line">
                25~75% 구간: <strong>{sumStats.p25}</strong> ~{" "}
                <strong>{sumStats.p75}</strong>
              </p>
              <p className="insights-line">
                최소 {sumStats.min} · 최대 {sumStats.max}
              </p>
            </div>

            <div className="insights-card">
              <h4>⚖️ 홀짝 비율 분포</h4>
              {Object.entries(dist).map(([k, v]) => {
                const pct = (v / total) * 100;
                return (
                  <div key={k} className="bar-row">
                    <span className="bar-label">{k}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct * 3}%` }}
                      />
                    </div>
                    <span className="bar-value">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
              <p className="insights-line insights-hint">
                💡 <strong>{mostCommonOE[0]}</strong>이 가장 흔함 ({oePct}%)
              </p>
            </div>

            <div className="insights-card">
              <h4>🔗 연속 번호 쌍 분포</h4>
              {Object.entries(stats.consecutiveDistribution).map(([k, v]) => {
                const pct = (v / total) * 100;
                return (
                  <div key={k} className="bar-row">
                    <span className="bar-label">{k}쌍</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct * 2}%` }}
                      />
                    </div>
                    <span className="bar-value">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="insights-disclaimer">
            ⚠️ 로또는 매번 독립 추첨이라 과거 데이터가 미래에 영향을 주지 않습니다.
            <br />
            모든 추첨 방식의 실제 당첨 확률은 동일합니다 (1/8,145,060).
          </p>
        </div>
      )}
    </section>
  );
}
