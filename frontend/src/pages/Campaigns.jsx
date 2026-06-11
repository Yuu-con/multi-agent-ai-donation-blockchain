import { Edit3, Plus, Power } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyBlock, ErrorBlock, LoadingBlock } from "../components/StateBlock.jsx";
import api, { getErrorMessage } from "../services/api.js";

const initialForm = {
  blockchain_campaign_id: "",
  title: "",
  description: "",
  receiver_wallet: "",
  target_amount: "",
};

function progressOf(campaign) {
  if (!campaign.target_amount) return 0;
  return Math.min(100, Math.round((campaign.total_received / campaign.target_amount) * 100));
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [localStatus, setLocalStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCampaigns = () => {
    setLoading(true);
    api
      .get("/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadCampaigns, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/campaigns", {
        ...form,
        blockchain_campaign_id: form.blockchain_campaign_id ? Number(form.blockchain_campaign_id) : null,
        target_amount: Number(form.target_amount),
      });
      setForm(initialForm);
      loadCampaigns();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isActive = (campaign) => localStatus[campaign.id] ?? campaign.active;

  return (
    <div>
      <div className="page-heading">
        <h1>Quản lý chiến dịch</h1>
        <p>Tạo chiến dịch mới, theo dõi ví nhận và số tiền đã quyên góp trong demo local.</p>
      </div>
      {error ? <ErrorBlock message={error} /> : null}

      <section className="panel mb-4">
        <div className="section-heading-row">
          <div>
            <h2>Tạo chiến dịch mới</h2>
            <p>Thông tin này lưu vào SQLite để frontend và dashboard đọc lại.</p>
          </div>
          <Plus size={22} />
        </div>
        <form className="form-grid" onSubmit={submit}>
          <input className="form-control" placeholder="Blockchain campaign ID tùy chọn" value={form.blockchain_campaign_id} onChange={(e) => setForm({ ...form, blockchain_campaign_id: e.target.value })} />
          <input className="form-control" required placeholder="Tên chiến dịch" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="form-control" required placeholder="Ví nhận" value={form.receiver_wallet} onChange={(e) => setForm({ ...form, receiver_wallet: e.target.value })} />
          <input className="form-control" required type="number" min="0" step="0.01" placeholder="Mục tiêu ETH" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
          <textarea className="form-control form-span" placeholder="Mô tả chiến dịch" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary icon-button" disabled={saving}>
            <Plus size={18} /> {saving ? "Đang lưu..." : "Tạo campaign"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Danh sách chiến dịch</h2>
        {loading ? <LoadingBlock /> : null}
        {!loading && campaigns.length === 0 ? <EmptyBlock /> : null}
        {!loading && campaigns.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle admin-table">
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Ví nhận</th>
                  <th>Tiến độ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const active = isActive(campaign);
                  const progress = progressOf(campaign);
                  return (
                    <tr key={campaign.id}>
                      <td>
                        <strong>{campaign.title}</strong>
                        <span className="table-subtitle">ID #{campaign.id}</span>
                      </td>
                      <td className="wallet-cell">{campaign.receiver_wallet}</td>
                      <td>
                        <div className="progress-label">
                          <span>{campaign.total_received.toFixed(3)} ETH</span>
                          <span>{campaign.target_amount.toFixed(3)} ETH</span>
                        </div>
                        <div className="progress small-progress">
                          <div className="progress-bar" style={{ width: `${progress}%` }} />
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${active ? "status-active" : "status-closed"}`}>
                          {active ? "Đang triển khai" : "Đã kết thúc"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-sm btn-outline-secondary icon-button" title="UI prototype, chưa có endpoint sửa">
                            <Edit3 size={15} /> Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary icon-button"
                            onClick={() => setLocalStatus((current) => ({ ...current, [campaign.id]: !active }))}
                            title="Đổi trạng thái ở UI demo, chưa lưu backend"
                          >
                            <Power size={15} /> {active ? "Tắt" : "Bật"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
