import { Bot, Database, Gauge, GitBranch, HandCoins, ShieldAlert } from "lucide-react";
import { useState } from "react";

import RiskBadge from "../components/RiskBadge.jsx";
import { ErrorBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const steps = [
  { label: "Người dùng quyên góp", icon: HandCoins },
  { label: "Blockchain ghi nhận", icon: GitBranch },
  { label: "Backend lưu giao dịch", icon: Database },
  { label: "AI agents phân tích", icon: Bot },
  { label: "Tính điểm rủi ro", icon: Gauge },
  { label: "Dashboard cảnh báo", icon: ShieldAlert },
];

export default function DemoFlow() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const runDemo = async (type) => {
    setRunning(true);
    setError("");
    try {
      const endpoint = type === "normal" ? "/transactions/demo-normal" : "/transactions/demo-risky";
      const res = await api.post(endpoint);
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-heading">
        <h1>Demo Flow</h1>
        <p>Minh họa luồng: quyên góp → blockchain → backend → AI agents → cảnh báo.</p>
      </div>

      {error ? <ErrorBlock message={error} /> : null}

      <div className="flow-row">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div className="flow-step" key={step.label}>
              <Icon size={22} />
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="toolbar">
        <button className="btn btn-success" disabled={running} onClick={() => runDemo("normal")}>Chạy demo giao dịch bình thường</button>
        <button className="btn btn-danger" disabled={running} onClick={() => runDemo("risky")}>Chạy demo giao dịch bất thường</button>
      </div>

      {result ? (
        <section className="panel demo-result">
          <h2>Kết quả xử lý</h2>
          <div className="demo-grid">
            <div>
              <h3>Thông tin giao dịch</h3>
              <p><strong>tx_hash:</strong> {result.transaction.tx_hash}</p>
              <p><strong>Sender:</strong> {result.transaction.sender_wallet}</p>
              <p><strong>Receiver:</strong> {result.transaction.receiver_wallet}</p>
              <p><strong>Amount:</strong> {result.transaction.amount} ETH</p>
            </div>
            <div>
              <h3>AI agents</h3>
              <ul className="flag-list">
                {result.agents.map((agent) => <li key={agent}>{agent}</li>)}
              </ul>
            </div>
            <div>
              <h3>Risk</h3>
              <div className="risk-score">{result.transaction.risk_score.toFixed(0)}<span>/100</span></div>
              <RiskBadge level={result.transaction.risk_level} />
              <p className="explanation">{result.transaction.explanation}</p>
            </div>
            <div>
              <h3>Flags gây rủi ro</h3>
              {result.flags.length ? (
                <ul className="flag-list">
                  {result.flags.map((flag) => <li key={flag}>{flag}</li>)}
                </ul>
              ) : (
                <p className="text-secondary">Không có flag nổi bật.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
