import { ArrowLeft, Bot, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import RiskBadge from "../components/RiskBadge.jsx";
import { ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function TransactionDetail() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/transactions/${id}`)
      .then((res) => setTransaction(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!transaction) return null;

  return (
    <div>
      <div className="page-heading">
        <Link to="/admin/transactions" className="small-link icon-button">
          <ArrowLeft size={16} /> Quay lại giao dịch
        </Link>
        <h1>Chi tiết giao dịch</h1>
        <p>{transaction.tx_hash}</p>
      </div>

      <section className="detail-grid">
        <div className="panel">
          <h2>Thông tin giao dịch</h2>
          <dl className="detail-list">
            <dt>Sender</dt><dd>{transaction.sender_wallet}</dd>
            <dt>Receiver</dt><dd>{transaction.receiver_wallet}</dd>
            <dt>Amount</dt><dd>{transaction.amount} ETH</dd>
            <dt>Timestamp</dt><dd>{new Date(transaction.timestamp).toLocaleString("vi-VN")}</dd>
            <dt>Campaign ID</dt><dd>{transaction.campaign_id}</dd>
          </dl>
        </div>

        <div className="panel risk-explanation-panel">
          <div className="section-heading-row">
            <div>
              <h2>Kết quả phân tích AI</h2>
              <p>Không kết luận chắc chắn gian lận, chỉ cảnh báo dấu hiệu bất thường.</p>
            </div>
            <ShieldAlert size={24} />
          </div>
          <div className="risk-score">{transaction.risk_score.toFixed(0)}<span>/100</span></div>
          <RiskBadge level={transaction.risk_level} />
          <p className="explanation">{transaction.explanation}</p>
          <h3><Bot size={17} /> Flags từ agent</h3>
          {transaction.flags?.length ? (
            <ul className="flag-list">
              {transaction.flags.map((flag) => <li key={flag}>{flag}</li>)}
            </ul>
          ) : (
            <p className="text-secondary mb-0">Không có flag nổi bật.</p>
          )}
        </div>
      </section>
    </div>
  );
}
