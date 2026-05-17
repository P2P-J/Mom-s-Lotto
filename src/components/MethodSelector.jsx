import { METHODS } from "../utils/numberGenerator";

export default function MethodSelector({ selectedMethod, onMethodChange }) {
  return (
    <div className="method-selector">
      {METHODS.map((method) => (
        <button
          key={method.id}
          className={`method-card ${selectedMethod === method.id ? "active" : ""}`}
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
