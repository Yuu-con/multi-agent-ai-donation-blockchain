import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import RiskBadge from "../components/RiskBadge.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function CustomerLookup() {
  const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return transactions.slice(0, 12);
    return transactions.filter((tx) => (
      tx.tx_hash.toLowerCase().includes(normalized) ||
      tx.sender_wallet.toLowerCase().includes(normalized) ||
      tx.receiver_wallet.toLowerCase().includes(normalized)
    ));
  }, [transactions, query]);

  return (
    <div>
      <div className="page-heading">
        <h1>Tra cứu giao dịch</h1>
        <p>Nhập mã giao dịch hoặc địa chỉ ví để xem lịch sử quyên góp trong dữ liệu demo.</p>
      </div>

      <div className="lookup-panel">
        <Search size={21} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nhập tx_hash, ví gửi hoặc ví nhận"
        />
      </div>

      {error ? <ErrorBlock message={error} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && filtered.length === 0 ? <EmptyBlock label="Không tìm thấy giao dịch phù hợp." /> : null}

      {!loading && filtered.length > 0 ? (
        <section className="panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>tx_hash</th>
                  <th>Ví gửi</th>
                  <th>Ví nhận</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td className="wallet-cell">{tx.tx_hash}</td>
                    <td className="wallet-cell">{tx.sender_wallet}</td>
                    <td className="wallet-cell">{tx.receiver_wallet}</td>
                    <td>{tx.amount.toFixed(3)} ETH</td>
                    <td>{new Date(tx.timestamp).toLocaleString("vi-VN")}</td>
                    <td><RiskBadge level={tx.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
