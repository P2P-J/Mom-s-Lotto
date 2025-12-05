/**
 * Statistics 컴포넌트 - 번호 통계 표시
 */
export default function Statistics({ stats }) {
  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: "➕",
      label: "합계",
      value: stats.sum,
    },
    {
      icon: "📊",
      label: "평균",
      value: stats.avg,
    },
    {
      icon: "🔢",
      label: "홀짝 비율",
      value: `${stats.oddCount}:${stats.evenCount}`,
    },
    {
      icon: "🔗",
      label: "연속 번호",
      value: stats.consecutive,
    },
  ];

  return (
    <div className="statistics">
      {statItems.map((item, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon">{item.icon}</div>
          <div className="stat-content">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
