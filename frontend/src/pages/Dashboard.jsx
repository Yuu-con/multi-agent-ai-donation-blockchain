import { AlertTriangle, BarChart3, HandCoins, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatCard from "../components/StatCard.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const riskColors = {
  "Thấp": "#15803d",
  "Tháº¥p": "#15803d",
  "Trung bình": "#d97706",
  "Trung bĂ¬nh": "#d97706",
  "Cao": "#ea580c",
  "Rất cao": "#dc2626",
  "Ráº¥t cao": "#dc2626",
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!summary) return <EmptyBlock />;

  return (
    <div>
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Admin command center</span>
          <h1>Giám sát quyên góp và cảnh báo rủi ro theo thời gian demo.</h1>
          <p>
            Dashboard tổng hợp campaign, giao dịch, điểm rủi ro và alert để quản trị viên kiểm tra.
            Hệ thống chỉ hỗ trợ phát hiện dấu hiệu bất thường, không kết luận chắc chắn gian lận.
          </p>
        </div>
        <div className="admin-hero-card">
          <AlertTriangle size={26} />
          <strong>{summary.high_risk_count}</strong>
          <span>giao dịch rủi ro cao</span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard icon={HandCoins} label="Chiến dịch" value={summary.total_campaigns} />
        <StatCard icon={BarChart3} label="Giao dịch" value={summary.total_transactions} />
        <StatCard icon={WalletCards} label="Tổng quyên góp" value={`${summary.total_donations_eth.toFixed(2)} ETH`} />
        <StatCard icon={AlertTriangle} label="Cảnh báo cao" value={summary.high_risk_count} hint={`${summary.active_alerts} alert đang mở`} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Phân bố mức rủi ro</h2>
          {summary.risk_distribution.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.risk_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="risk_level" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {summary.risk_distribution.map((entry) => (
                    <Cell key={entry.risk_level} fill={riskColors[entry.risk_level] || "#64748b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock />
          )}
        </section>

        <section className="panel">
          <h2>Giao dịch theo thời gian</h2>
          {summary.transactions_over_time.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={summary.transactions_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyBlock />
          )}
        </section>
      </div>
    </div>
  );
}
