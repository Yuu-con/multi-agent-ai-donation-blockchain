import { Bot, Database, Gauge, GitBranch, HandCoins, RefreshCw, ShieldAlert } from "lucide-react";
import { useState } from "react";

import RiskBadge from "../components/RiskBadge.jsx";
import { ErrorBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const steps = [
  { label: "Customer quyên góp", icon: HandCoins },
  { label: "Blockchain ghi nhận", icon: GitBranch },
  { label: "Backend lưu giao dịch", icon: Database },
  { label: "AI agents phân tích", icon: Bot },
  { label: "Tính điểm rủi ro", icon: Gauge },
  { label: "Dashboard cảnh báo", icon: ShieldAlert },
];

const initialForm = {
  campaign_id: "",
  tx_hash: "",
  sender_wallet: "",
  receiver_wallet: "",
  amount: "0.2",
  wallet_age_days: "180",
  receiver_verified: "true",
  recent_tx_count: "1",
  avg_amount: "0.25",
  transfer_out_ratio: "0.05",
  transfer_out_time: "12",
};

const presets = {
  normal: {
    amount: "0.2",
    wallet_age_days: "180",
    receiver_verified: "true",
    recent_tx_count: "1",
    avg_amount: "0.25",
    transfer_out_ratio: "0.05",
    transfer_out_time: "12",
  },
  risky: {
    amount: "6",
    wallet_age_days: "2",
    receiver_verified: "false",
    recent_tx_count: "9",
    avg_amount: "0.4",
    transfer_out_ratio: "0.95",
    transfer_out_time: "0.2",
  },
};

export default function DemoFlow() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const applyPreset = (type) => {
    setForm((current) => ({ ...current, ...presets[type] }));
    setResult(null);
    setError("");
  };

  const buildPayload = () => {
    const optionalText = (value) => value.trim() || undefined;
    const optionalNumber = (value) => (value === "" ? undefined : Number(value));
    return {
      campaign_id: optionalNumber(form.campaign_id),
      tx_hash: optionalText(form.tx_hash),
      sender_wallet: optionalText(form.sender_wallet),
      receiver_wallet: optionalText(form.receiver_wallet),
      amount: Number(form.amount),
      wallet_age_days: Number(form.wallet_age_days),
      receiver_verified: form.receiver_verified === "true",
      recent_tx_count: Number(form.recent_tx_count),
      avg_amount: Number(form.avg_amount),
      transfer_out_ratio: Number(form.transfer_out_ratio),
      transfer_out_time: Number(form.transfer_out_time),
    };
  };

  const submitDemo = async (event) => {
    event.preventDefault();
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/transactions/demo-custom", buildPayload());
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <section className="demo-hero">
        <div>
          <span className="eyebrow">Presentation mode</span>
          <h1>Demo luồng xử lý từ quyên góp đến cảnh báo AI.</h1>
          <p>
            Nhập dữ liệu giao dịch thủ công hoặc nạp mẫu nhanh để giảng viên thấy từng tiêu chí ảnh hưởng đến risk score.
          </p>
        </div>
        <Bot size={42} />
      </section>

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

      <section className="panel mb-3">
        <div className="section-heading-row">
          <div>
            <h2>Dữ liệu giao dịch demo</h2>
            <p>Thay đổi các trường để xem AI agents tính lại điểm rủi ro.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-success icon-button" onClick={() => applyPreset("normal")}>
              <RefreshCw size={18} /> Mẫu bình thường
            </button>
            <button type="button" className="btn btn-outline-danger icon-button" onClick={() => applyPreset("risky")}>
              <RefreshCw size={18} /> Mẫu bất thường
            </button>
          </div>
        </div>

        <form onSubmit={submitDemo}>
          <div className="form-grid">
            <label className="form-span">
              <span className="form-label">Campaign ID</span>
              <input className="form-control" value={form.campaign_id} onChange={(e) => updateField("campaign_id", e.target.value)} placeholder="Để trống để dùng campaign demo đầu tiên" />
            </label>
            <label className="form-span">
              <span className="form-label">Transaction hash</span>
              <input className="form-control" value={form.tx_hash} onChange={(e) => updateField("tx_hash", e.target.value)} placeholder="Để trống để hệ thống tự sinh" />
            </label>
            <label><span className="form-label">Ví gửi</span><input className="form-control" value={form.sender_wallet} onChange={(e) => updateField("sender_wallet", e.target.value)} placeholder="Để trống để tự sinh" /></label>
            <label><span className="form-label">Ví nhận</span><input className="form-control" value={form.receiver_wallet} onChange={(e) => updateField("receiver_wallet", e.target.value)} placeholder="Để trống để dùng ví campaign" /></label>
            <label><span className="form-label">Số tiền ETH</span><input type="number" min="0.001" step="0.001" required className="form-control" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} /></label>
            <label><span className="form-label">Số tiền trung bình ETH</span><input type="number" min="0.001" step="0.001" required className="form-control" value={form.avg_amount} onChange={(e) => updateField("avg_amount", e.target.value)} /></label>
            <label><span className="form-label">Tuổi ví gửi ngày</span><input type="number" min="0" required className="form-control" value={form.wallet_age_days} onChange={(e) => updateField("wallet_age_days", e.target.value)} /></label>
            <label>
              <span className="form-label">Ví nhận đã xác minh</span>
              <select className="form-select" value={form.receiver_verified} onChange={(e) => updateField("receiver_verified", e.target.value)}>
                <option value="true">Đã xác minh</option>
                <option value="false">Chưa xác minh</option>
              </select>
            </label>
            <label><span className="form-label">Số giao dịch gần đây</span><input type="number" min="0" required className="form-control" value={form.recent_tx_count} onChange={(e) => updateField("recent_tx_count", e.target.value)} /></label>
            <label><span className="form-label">Tỉ lệ chuyển tiền đi</span><input type="number" min="0" max="1" step="0.01" required className="form-control" value={form.transfer_out_ratio} onChange={(e) => updateField("transfer_out_ratio", e.target.value)} /></label>
            <label><span className="form-label">Thời gian chuyển tiền đi phút</span><input type="number" min="0" step="0.1" required className="form-control" value={form.transfer_out_time} onChange={(e) => updateField("transfer_out_time", e.target.value)} /></label>
          </div>

          <button className="btn btn-primary icon-button mt-3" disabled={running} type="submit">
            <Bot size={18} /> {running ? "Đang phân tích..." : "Phân tích giao dịch demo"}
          </button>
        </form>
      </section>

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
