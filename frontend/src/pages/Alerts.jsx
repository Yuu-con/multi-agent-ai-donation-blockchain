import { useEffect, useState } from "react";

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
      <div className="page-heading">
        <h1>Alerts</h1>
        <p>Theo dõi cảnh báo cần quản trị viên kiểm tra thêm.</p>
      </div>
      {error ? <ErrorBlock message={error} /> : null}
      <section className="panel">
        {loading ? <LoadingBlock /> : null}
        {!loading && alerts.length === 0 ? <EmptyBlock /> : null}
        {!loading && alerts.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Transaction</th>
                  <th>Risk</th>
                  <th>Message</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.transaction_id}</td>
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
