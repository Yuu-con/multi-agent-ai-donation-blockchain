import { ArrowLeft, CheckCircle2, HandCoins, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import RiskBadge from "../components/RiskBadge.jsx";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const DEFAULT_WALLET = "0xCustomerDemo000000000000000000000000000001";

function getProgress(campaign) {
  if (!campaign?.target_amount) return 0;
  return Math.min(100, Math.round((campaign.total_received / campaign.target_amount) * 100));
}

export default function CustomerCampaignDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("0.2");
  const [senderWallet, setSenderWallet] = useState(DEFAULT_WALLET);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/campaigns"), api.get("/transactions")])
      .then(([campaignRes, transactionRes]) => {
        const found = campaignRes.data.find((item) => String(item.id) === String(id));
        setCampaign(found || null);
        setTransactions(transactionRes.data.filter((tx) => String(tx.campaign_id) === String(id)));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const latestTransactions = useMemo(() => transactions.slice(0, 8), [transactions]);

  const submitDonation = async (event) => {
    event.preventDefault();
    if (!campaign) return;
    setDonating(true);
    setError("");
    try {
      const numericAmount = Number(amount);
      const res = await api.post("/transactions/demo-custom", {
        campaign_id: campaign.id,
        sender_wallet: senderWallet || DEFAULT_WALLET,
        receiver_wallet: campaign.receiver_wallet,
        amount: numericAmount,
        wallet_age_days: 120,
        receiver_verified: true,
        recent_tx_count: 1,
        avg_amount: Math.max(0.05, numericAmount * 0.8),
        transfer_out_ratio: 0.05,
        transfer_out_time: 20,
      });
      const donationResult = {
        ...res.data,
        campaignTitle: campaign.title,
        donorName: user?.username || "customer",
      };
      localStorage.setItem("last_donation_result", JSON.stringify(donationResult));
      navigate(`/customer/donations/${res.data.transaction.id}`, { state: donationResult });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!campaign) return <EmptyBlock title="Không tìm thấy chiến dịch" message="Chiến dịch này không tồn tại trong dữ liệu demo." />;

  const progress = getProgress(campaign);

  return (
    <div>
      <Link to="/customer" className="small-link icon-button">
        <ArrowLeft size={16} /> Quay lại danh sách chiến dịch
      </Link>

      <section className="campaign-detail-hero">
        <div>
          <span className={`status-pill ${campaign.active ? "status-active" : "status-closed"}`}>
            {campaign.active ? "Đang triển khai" : "Đã kết thúc"}
          </span>
          <h1>{campaign.title}</h1>
          <p>{campaign.description || "Chiến dịch quyên góp demo trong hệ thống blockchain local."}</p>
          <div className="wallet-strip large"><Wallet size={16} /> {campaign.receiver_wallet}</div>
        </div>
        <div className="donation-progress-card">
          <span>Đã nhận</span>
          <strong>{campaign.total_received.toFixed(3)} ETH</strong>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <small>Mục tiêu {campaign.target_amount.toFixed(3)} ETH</small>
        </div>
      </section>

      <div className="customer-detail-grid">
        <section className="panel donation-form-panel">
          <h2>Quyên góp cho chiến dịch</h2>
          <p className="text-secondary">
            Prototype hiện mô phỏng giao dịch qua API demo để vẫn chạy qua AI pipeline. Khi cấu hình Ganache/Web3,
            form này có thể chuyển sang gọi smart contract.
          </p>
          <form onSubmit={submitDonation}>
            <label className="form-label">Ví gửi</label>
            <input className="form-control" value={senderWallet} onChange={(event) => setSenderWallet(event.target.value)} />
            <label className="form-label mt-3">Số tiền ETH</label>
            <input
              className="form-control form-control-lg"
              type="number"
              min="0.001"
              step="0.001"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
            <button className="btn btn-primary btn-lg icon-button w-100 justify-content-center mt-4" disabled={donating || !campaign.active}>
              <HandCoins size={19} /> {donating ? "Đang gửi giao dịch..." : "Quyên góp"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Lịch sử giao dịch của chiến dịch</h2>
          {latestTransactions.length === 0 ? (
            <EmptyBlock title="Chưa có giao dịch" message="Hãy tạo giao dịch demo đầu tiên cho chiến dịch này." />
          ) : (
            <div className="compact-list">
              {latestTransactions.map((tx) => (
                <div className="compact-row" key={tx.id}>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{tx.amount.toFixed(3)} ETH</strong>
                    <span>{tx.tx_hash.slice(0, 18)}...</span>
                  </div>
                  <RiskBadge level={tx.risk_level} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
