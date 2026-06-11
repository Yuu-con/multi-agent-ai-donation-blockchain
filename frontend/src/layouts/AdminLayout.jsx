import { AlertTriangle, BarChart3, Bot, Flag, GitBranch, HandCoins, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/campaigns", label: "Campaigns", icon: HandCoins },
  { to: "/admin/transactions", label: "Transactions", icon: BarChart3 },
  { to: "/admin/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/demo-flow", label: "Demo Flow", icon: GitBranch },
];

export default function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand brand-dark">
          <span className="brand-mark"><Flag size={18} /></span>
          <span>Donation AI</span>
        </div>
        <nav className="nav flex-column gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link admin-nav-link">
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Bot size={18} />
          <span>AI agents chỉ cảnh báo bất thường, không kết luận gian lận.</span>
        </div>
      </aside>
      <div className="admin-main">
        <header className="topbar">
          <div>
            <div className="topbar-label">Admin workspace</div>
            <strong>{user.name}</strong>
          </div>
          <button className="btn btn-outline-secondary icon-button" onClick={onLogout}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </header>
        <main className="content admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
