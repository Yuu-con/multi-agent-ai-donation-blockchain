import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import RiskBadge from "../components/RiskBadge.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const statuses = ["New", "Reviewing", "Resolved"];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = () => {
    setLoading(true);
    api
      .get("/alerts")
      .then((res) => setAlerts(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAlerts, []);

  const updateStatus = async (alert, status) => {
    try {
      await api.put(`/alerts/${alert.id}/status`, { status });
      loadAlerts();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <section className="alert-hero">
        <div>
          <span className="eyebrow">Risk review queue</span>
          <h1>Cảnh báo rủi ro cần quản trị viên kiểm tra.</h1>
          <p>AI agents chỉ chỉ ra dấu hiệu bất thường, admin là người xem ngữ cảnh và quyết định bước xử lý.</p>
        </div>
        <AlertTriangle size={38} />
      </section>

      {error ? <ErrorBlock message={error} /> : null}
      <section className="panel">
        {loading ? <LoadingBlock /> : null}
        {!loading && alerts.length === 0 ? <EmptyBlock /> : null}
        {!loading && alerts.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Transaction</th>
                  <th>Risk</th>
                  <th>Lý do cảnh báo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td><Link to={`/admin/transactions/${alert.transaction_id}`}>#{alert.transaction_id}</Link></td>
                    <td><RiskBadge level={alert.risk_level} /> <span className="ms-2">{alert.risk_score.toFixed(0)}</span></td>
                    <td>{alert.message}</td>
                    <td>
                      <select className="form-select form-select-sm" value={alert.status} onChange={(e) => updateStatus(alert, e.target.value)}>
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
