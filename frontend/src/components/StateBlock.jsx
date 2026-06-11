export function LoadingBlock({ label = "Đang tải dữ liệu..." }) {
  return <div className="state-block">{label}</div>;
}

export function ErrorBlock({ message }) {
  return <div className="alert alert-danger mb-3">{message}</div>;
}

export function EmptyBlock({ label, title, message }) {
  return (
    <div className="state-block text-secondary">
      <strong>{title || label || "Chưa có dữ liệu."}</strong>
      {message ? <span>{message}</span> : null}
    </div>
  );
}
