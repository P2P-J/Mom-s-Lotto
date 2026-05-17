/**
 * Header 컴포넌트 - 앱 제목과 부제목
 */
export default function Header() {
  return (
    <header className="header">
      <h1 className="title">
        <span className="sparkle">✨</span>
        엄마를 위한 로또 번호 추첨기
        <span className="sparkle">✨</span>
      </h1>
      <p className="subtitle">역대 동행복권 당첨 데이터로 뽑아드리는 특별한 행운</p>
    </header>
  );
}
