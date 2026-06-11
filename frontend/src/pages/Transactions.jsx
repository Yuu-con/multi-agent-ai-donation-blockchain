import { PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import RiskBadge from "../components/RiskBadge.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [lastDemo, setLastDemo] = useState(null);

  const loadTransactions = () => {
    setLoading(true);
    api
      .get("/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadTransactions, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesText =
        !normalized ||
        tx.tx_hash.toLowerCase().includes(normalized) ||
        tx.sender_wallet.toLowerCase().includes(normalized) ||
        tx.receiver_wallet.toLowerCase().includes(normalized);
      const matchesRisk = !riskLevel || tx.risk_level === riskLevel;
      return matchesText && matchesRisk;
    });
  }, [transactions, query, riskLevel]);

  const createDemo = async (type) => {
    setError("");
    try {
      const endpoint = type === "normal" ? "/transactions/demo-normal" : "/transactions/demo-risky";
      const res = await api.post(endpoint);
      setLastDemo(res.data.transaction);
      loadTransactions();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-heading">
        <h1>Transactions</h1>
        <p>Tra cứu giao dịch, điểm rủi ro và giải thích từ pipeline đa tác nhân.</p>
      </div>
      {error ? <ErrorBlock message={error} /> : null}

      <div className="toolbar">
        <input className="form-control" placeholder="Tìm theo ví hoặc tx_hash" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="form-select" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
          <option value="">Tất cả mức rủi ro</option>
          <option value="Thấp">Thấp</option>
          <option value="Trung bình">Trung bình</option>
          <option value="Cao">Cao</option>
          <option value="Rất cao">Rất cao</option>
        </select>
        <button className="btn btn-outline-success icon-button" onClick={() => createDemo("normal")}>
          <PlayCircle size={18} /> Demo thường
        </button>
        <button className="btn btn-outline-danger icon-button" onClick={() => createDemo("risky")}>
          <PlayCircle size={18} /> Demo bất thường
        </button>
      </div>

      {lastDemo ? (
        <div className="alert alert-info">
          Giao dịch demo vừa tạo: <strong>{lastDemo.risk_score.toFixed(0)}/100</strong> - {lastDemo.explanation}
        </div>
      ) : null}

      <section className="panel">
        {loading ? <LoadingBlock /> : null}
        {!loading && filtered.length === 0 ? <EmptyBlock /> : null}
        {!loading && filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>tx_hash</th>
                  <th>sender</th>
                  <th>receiver</th>
                  <th>amount</th>
                  <th>timestamp</th>
                  <th>risk_score</th>
                  <th>risk_level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td><Link to={`/transactions/${tx.id}`}>{tx.tx_hash.slice(0, 14)}...</Link></td>
                    <td className="wallet-cell">{tx.sender_wallet}</td>
                    <td className="wallet-cell">{tx.receiver_wallet}</td>
                    <td>{tx.amount.toFixed(3)} ETH</td>
                    <td>{new Date(tx.timestamp).toLocaleString("vi-VN")}</td>
                    <td>{tx.risk_score.toFixed(0)}</td>
                    <td><RiskBadge level={tx.risk_level} /></td>
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
