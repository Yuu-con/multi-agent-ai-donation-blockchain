export function LoadingBlock({ label = "Đang tải dữ liệu..." }) {
  return <div className="state-block">{label}</div>;
}

export function ErrorBlock({ message }) {
  return <div className="alert alert-danger mb-0">{message}</div>;
}

export function EmptyBlock({ label = "Chưa có dữ liệu." }) {
  return <div className="state-block text-secondary">{label}</div>;
}
