const normalizedLevel = {
  "Thấp": "Thấp",
  "Tháº¥p": "Thấp",
  "Trung bình": "Trung bình",
  "Trung bĂ¬nh": "Trung bình",
  "Cao": "Cao",
  "Rất cao": "Rất cao",
  "Ráº¥t cao": "Rất cao",
};

const classByLevel = {
  "Thấp": "text-bg-success",
  "Trung bình": "text-bg-warning",
  "Cao": "text-bg-orange",
  "Rất cao": "text-bg-danger",
};

export default function RiskBadge({ level }) {
  const label = normalizedLevel[level] || level || "N/A";
  return <span className={`badge risk-badge ${classByLevel[label] || "text-bg-secondary"}`}>{label}</span>;
}
