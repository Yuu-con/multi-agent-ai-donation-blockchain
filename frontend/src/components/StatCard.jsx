export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <div className="stat-label">{label}</div>
        {Icon ? <span className="stat-icon"><Icon size={19} /></span> : null}
      </div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="stat-hint">{hint}</div> : <div className="stat-hint">Cập nhật từ API</div>}
    </div>
  );
}
