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
  "Thấp": "#198754",
  "Trung bình": "#f0ad4e",
  "Cao": "#fd7e14",
  "Rất cao": "#dc3545",
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
      <div className="page-heading">
        <h1>Dashboard tổng quan</h1>
        <p>Theo dõi giao dịch quyên góp, điểm rủi ro và cảnh báo bất thường.</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Campaign" value={summary.total_campaigns} />
        <StatCard label="Giao dịch" value={summary.total_transactions} />
        <StatCard label="Tổng quyên góp" value={`${summary.total_donations_eth.toFixed(2)} ETH`} />
        <StatCard label="Cảnh báo cao" value={summary.high_risk_count} hint={`${summary.active_alerts} alert đang mở`} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Phân bố mức rủi ro</h2>
          {summary.risk_distribution.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={summary.risk_distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk_level" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {summary.risk_distribution.map((entry) => (
                    <Cell key={entry.risk_level} fill={riskColors[entry.risk_level] || "#6c757d"} />
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0d6efd" strokeWidth={2} />
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
