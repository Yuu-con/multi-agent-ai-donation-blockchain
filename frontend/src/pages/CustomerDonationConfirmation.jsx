import { CheckCircle2, Clock, Copy, Hash, Wallet } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import RiskBadge from "../components/RiskBadge.jsx";
import { EmptyBlock } from "../components/StateBlock.jsx";

function readFallbackDonation() {
  try {
    const raw = localStorage.getItem("last_donation_result");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CustomerDonationConfirmation() {
  const location = useLocation();
  const result = location.state || readFallbackDonation();

  if (!result?.transaction) {
    return <EmptyBlock label="Chưa có giao dịch quyên góp để hiển thị." />;
  }

  const tx = result.transaction;

  return (
    <div>
      <section className="confirmation-hero">
        <CheckCircle2 size={44} />
        <span className="eyebrow">Giao dịch đã được ghi nhận</span>
        <h1>Cảm ơn bạn đã quyên góp cho {result.campaignTitle || `campaign #${tx.campaign_id}`}.</h1>
        <p>
          Đây là giao dịch demo local. Hệ thống đã lưu giao dịch, chạy AI agents và tạo điểm rủi ro để admin giám sát.
        </p>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <h2>Xác nhận giao dịch</h2>
          <dl className="detail-list">
            <dt><Hash size={15} /> tx_hash</dt><dd>{tx.tx_hash}</dd>
            <dt><Wallet size={15} /> Ví gửi</dt><dd>{tx.sender_wallet}</dd>
            <dt>Ví nhận</dt><dd>{tx.receiver_wallet}</dd>
            <dt>Số tiền</dt><dd>{tx.amount} ETH</dd>
            <dt><Clock size={15} /> Thời gian</dt><dd>{new Date(tx.timestamp).toLocaleString("vi-VN")}</dd>
            <dt>Trạng thái</dt><dd>Thành công</dd>
          </dl>
        </div>

        <div className="panel">
          <h2>Kết quả AI</h2>
          <div className="risk-score">{tx.risk_score.toFixed(0)}<span>/100</span></div>
          <RiskBadge level={tx.risk_level} />
          <p className="explanation">{tx.explanation}</p>
          <div className="note-box">
            Hệ thống chỉ cảnh báo dấu hiệu bất thường, không kết luận chắc chắn giao dịch gian lận.
          </div>
        </div>
      </section>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button className="btn btn-outline-secondary icon-button" onClick={() => navigator.clipboard?.writeText(tx.tx_hash)}>
          <Copy size={17} /> Sao chép tx_hash
        </button>
        <Link className="btn btn-primary" to="/customer/lookup">Tra cứu giao dịch</Link>
        <Link className="btn btn-outline-primary" to="/customer">Quay lại chiến dịch</Link>
      </div>
    </div>
  );
}
