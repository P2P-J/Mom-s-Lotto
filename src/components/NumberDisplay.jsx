import { getNumberColor } from "../utils/colors";

/**
 * NumberDisplay 컴포넌트 - 생성된 번호 표시
 */
export default function NumberDisplay({ numbers, bonus }) {
  if (!numbers) {
    return null;
  }

  return (
    <div className="number-display">
      <div className="main-numbers">
        {numbers.map((num, index) => (
          <div
            key={index}
            className="number-ball"
            style={{
              backgroundColor: getNumberColor(num),
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {num}
          </div>
        ))}
      </div>

      <div className="bonus-section">
        <span className="bonus-label">보너스</span>
        <div
          className="number-ball bonus-ball"
          style={{ backgroundColor: getNumberColor(bonus) }}
        >
          {bonus}
        </div>
      </div>
    </div>
  );
}
