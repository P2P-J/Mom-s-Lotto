import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import MethodSelector from "./components/MethodSelector";
import NumberDisplay from "./components/NumberDisplay";
import Statistics from "./components/Statistics";
import ActionButtons from "./components/ActionButtons";
import { generateNumbers } from "./utils/numberGenerator";
import { calculateStatistics } from "./utils/statistics";

function App() {
  const [selectedMethod, setSelectedMethod] = useState("smart");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 번호 생성 핸들러
  const handleGenerate = () => {
    setIsLoading(true);

    // 로딩 애니메이션을 위한 지연
    setTimeout(() => {
      const generated = generateNumbers(selectedMethod);
      setResult(generated);
      setIsLoading(false);
    }, 500);
  };

  // 초기화 핸들러
  const handleReset = () => {
    setResult(null);
  };

  // 추첨 방식 변경 핸들러
  const handleMethodChange = (method) => {
    setSelectedMethod(method);
  };

  // 통계 계산
  const stats = result ? calculateStatistics(result.numbers) : null;

  return (
    <div className="app-container">
      <Header />

      <div className="content">
        <MethodSelector
          selectedMethod={selectedMethod}
          onMethodChange={handleMethodChange}
        />

        <ActionButtons
          onGenerate={handleGenerate}
          onReset={handleReset}
          hasNumbers={result !== null}
          isLoading={isLoading}
        />

        {result && (
          <>
            <NumberDisplay numbers={result.numbers} bonus={result.bonus} />

            <Statistics stats={stats} />
          </>
        )}
      </div>

      <footer className="footer">
        <p>💝 Made with love for Mom</p>
        <p className="disclaimer">
          본 서비스는 재미와 교육 목적으로 제공됩니다. 결과에 대한 책임은
          사용자에게 있습니다.
        </p>
      </footer>
    </div>
  );
}

export default App;
