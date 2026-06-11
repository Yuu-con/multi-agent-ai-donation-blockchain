const classByLevel = {
  "Thấp": "text-bg-success",
  "Trung bình": "text-bg-warning",
  "Cao": "text-bg-orange",
  "Rất cao": "text-bg-danger",
};

export default function RiskBadge({ level }) {
  return <span className={`badge ${classByLevel[level] || "text-bg-secondary"}`}>{level || "N/A"}</span>;
}
