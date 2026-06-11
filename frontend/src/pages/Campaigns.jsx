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

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(initialForm);
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

  return (
    <div>
      <div className="page-heading">
        <h1>Campaigns</h1>
        <p>Tạo và quản lý chiến dịch quyên góp trong demo local.</p>
      </div>
      {error ? <ErrorBlock message={error} /> : null}

      <section className="panel mb-4">
        <h2>Tạo chiến dịch mới</h2>
        <form className="form-grid" onSubmit={submit}>
          <input className="form-control" placeholder="Blockchain campaign ID (tùy chọn)" value={form.blockchain_campaign_id} onChange={(e) => setForm({ ...form, blockchain_campaign_id: e.target.value })} />
          <input className="form-control" required placeholder="Tên chiến dịch" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="form-control" required placeholder="Ví nhận" value={form.receiver_wallet} onChange={(e) => setForm({ ...form, receiver_wallet: e.target.value })} />
          <input className="form-control" required type="number" min="0" step="0.01" placeholder="Mục tiêu ETH" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
          <textarea className="form-control form-span" placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary" disabled={saving}>{saving ? "Đang lưu..." : "Tạo campaign"}</button>
        </form>
      </section>

      <section className="panel">
        <h2>Danh sách chiến dịch</h2>
        {loading ? <LoadingBlock /> : null}
        {!loading && campaigns.length === 0 ? <EmptyBlock /> : null}
        {!loading && campaigns.length > 0 ? (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Ví nhận</th>
                  <th>Mục tiêu</th>
                  <th>Đã nhận</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.id}</td>
                    <td>{campaign.title}</td>
                    <td className="wallet-cell">{campaign.receiver_wallet}</td>
                    <td>{campaign.target_amount} ETH</td>
                    <td>{campaign.total_received.toFixed(3)} ETH</td>
                    <td>{campaign.active ? "Active" : "Closed"}</td>
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
