/**
 * ActionButtons 컴포넌트 - 번호 생성 및 초기화 버튼
 */
export default function ActionButtons({
  onGenerate,
  onReset,
  hasNumbers,
  isLoading,
}) {
  return (
    <div className="action-buttons">
      <button className="btn-primary" onClick={onGenerate} disabled={isLoading}>
        {isLoading ? "번호 생성 중..." : "🎰 번호 뽑기"}
      </button>

      {hasNumbers && (
        <button
          className="btn-secondary"
          onClick={onReset}
          disabled={isLoading}
        >
          🔄 초기화
        </button>
      )}
    </div>
  );
}
