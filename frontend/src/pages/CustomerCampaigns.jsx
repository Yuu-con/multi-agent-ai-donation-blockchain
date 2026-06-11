import { ArrowRight, HandCoins, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

function campaignProgress(campaign) {
  if (!campaign.target_amount) return 0;
  return Math.min(100, Math.round((campaign.total_received / campaign.target_amount) * 100));
}

export default function CustomerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (!normalized) return true;
      return (
        campaign.title.toLowerCase().includes(normalized) ||
        campaign.description?.toLowerCase().includes(normalized) ||
        campaign.receiver_wallet.toLowerCase().includes(normalized)
      );
    });
  }, [campaigns, query]);

  return (
    <div>
      <section className="customer-hero">
        <div>
          <span className="eyebrow">Customer portal</span>
          <h1>Chọn chiến dịch và quyên góp minh bạch trên blockchain local.</h1>
          <p>
            Mỗi giao dịch demo sẽ được backend ghi nhận, AI agents phân tích dấu hiệu bất thường,
            và admin có thể xem cảnh báo trong dashboard.
          </p>
        </div>
        <div className="hero-metric">
          <HandCoins size={26} />
          <strong>{campaigns.length}</strong>
          <span>chiến dịch đang theo dõi</span>
        </div>
      </section>

      <div className="customer-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm chiến dịch hoặc ví nhận" />
        </div>
      </div>

      {error ? <ErrorBlock message={error} /> : null}
      {loading ? <LoadingBlock /> : null}
      {!loading && filtered.length === 0 ? <EmptyBlock /> : null}

      {!loading && filtered.length > 0 ? (
        <div className="campaign-card-grid">
          {filtered.map((campaign) => {
            const progress = campaignProgress(campaign);
            return (
              <article className="campaign-card" key={campaign.id}>
                <div className="campaign-card-top">
                  <span className={`status-pill ${campaign.active ? "status-active" : "status-closed"}`}>
                    {campaign.active ? "Đang triển khai" : "Đã kết thúc"}
                  </span>
                  <ShieldCheck size={20} />
                </div>
                <h2>{campaign.title}</h2>
                <p>{campaign.description || "Chưa có mô tả chi tiết cho chiến dịch này."}</p>
                <div className="wallet-strip">{campaign.receiver_wallet}</div>
                <div className="campaign-progress">
                  <div className="progress-label">
                    <span>{campaign.total_received.toFixed(3)} ETH</span>
                    <span>{campaign.target_amount.toFixed(3)} ETH</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <Link className="btn btn-primary icon-button w-100 justify-content-center" to={`/customer/campaigns/${campaign.id}`}>
                  Xem và quyên góp <ArrowRight size={18} />
                </Link>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
