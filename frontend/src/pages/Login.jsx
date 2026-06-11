import { ArrowRight, ShieldCheck, WalletCards } from "lucide-react";
import { useState } from "react";

import { authenticate } from "../auth.js";

export default function Login({ onLogin, redirectPath }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    setError("");
    try {
      onLogin(authenticate(username, password), redirectPath);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span className="brand-mark"><ShieldCheck size={20} /></span>
          <span>Donation AI</span>
        </div>
        <div className="login-copy">
          <span className="eyebrow">Blockchain donation monitoring</span>
          <h1>Minh bạch quyên góp, phát hiện bất thường bằng AI đa tác nhân.</h1>
          <p>
            Prototype local cho phép Customer quyên góp, Admin giám sát giao dịch,
            điểm rủi ro và giải thích cảnh báo.
          </p>
        </div>
        <div className="login-insight-card">
          <div>
            <strong>AI Risk Pipeline</strong>
            <span>5 agents phân tích giao dịch</span>
          </div>
          <div className="mini-bars" aria-hidden="true">
            <span style={{ height: "28%" }} />
            <span style={{ height: "54%" }} />
            <span style={{ height: "76%" }} />
            <span style={{ height: "92%" }} />
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-icon"><WalletCards size={28} /></div>
          <h2>Đăng nhập hệ thống</h2>
          <p>Nhập tài khoản demo, hệ thống tự xác định Customer hoặc Admin.</p>

          {error ? <div className="alert alert-danger">{error}</div> : null}

          <label className="form-label">Username</label>
          <input
            className="form-control form-control-lg"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin hoặc customer"
            autoFocus
          />

          <label className="form-label mt-3">Password</label>
          <input
            className="form-control form-control-lg"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          <button className="btn btn-primary btn-lg icon-button login-submit" type="submit">
            Đăng nhập <ArrowRight size={18} />
          </button>

          <div className="login-hints">
            <span>admin / admin123</span>
            <span>customer / customer123</span>
          </div>
        </form>
      </section>
    </main>
  );
}
