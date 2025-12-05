/**
 * MethodSelector 컴포넌트 - 추첨 방식 선택
 */
export default function MethodSelector({ selectedMethod, onMethodChange }) {
  const methods = [
    {
      id: "smart",
      icon: "🎯",
      title: "스마트 추천",
      description: "과거 당첨 데이터 기반 분석",
    },
    {
      id: "balanced",
      icon: "⚖️",
      title: "균형 조합",
      description: "구간별 고른 분포",
    },
    {
      id: "random",
      icon: "🎲",
      title: "완전 랜덤",
      description: "순수 무작위 선택",
    },
  ];

  return (
    <div className="method-selector">
      {methods.map((method) => (
        <button
          key={method.id}
          className={`method-card ${
            selectedMethod === method.id ? "active" : ""
          }`}
          onClick={() => onMethodChange(method.id)}
        >
          <div className="method-icon">{method.icon}</div>
          <h3 className="method-title">{method.title}</h3>
          <p className="method-description">{method.description}</p>
        </button>
      ))}
    </div>
  );
}
