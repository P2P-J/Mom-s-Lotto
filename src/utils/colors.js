/**
 * 번호 범위에 따라 로또 공 색상 반환
 * 공식 로또 색상 스킴과 유사
 */
export function getNumberColor(num) {
  if (num >= 1 && num <= 10) return "#fbbf24"; // 노란색
  if (num >= 11 && num <= 20) return "#60a5fa"; // 파란색
  if (num >= 21 && num <= 30) return "#f87171"; // 빨간색
  if (num >= 31 && num <= 40) return "#94a3b8"; // 회색
  if (num >= 41 && num <= 45) return "#34d399"; // 초록색
  return "#6366f1"; // 기본 색상
}
