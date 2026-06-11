import { Flag, HandCoins, History, LogOut, Search } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const customerNav = [
  { to: "/customer", label: "Chiến dịch", icon: HandCoins, end: true },
  { to: "/customer/lookup", label: "Tra cứu giao dịch", icon: Search },
  { to: "/customer/history", label: "Lịch sử của tôi", icon: History },
];

export default function CustomerLayout({ user, onLogout }) {
  return (
    <div className="customer-shell">
      <header className="customer-header">
        <div className="brand">
          <span className="brand-mark"><Flag size={18} /></span>
          <span>Donation AI</span>
        </div>
        <nav className="customer-nav">
          {customerNav.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink key={`${item.label}-${index}`} to={item.to} end={item.end} className="customer-nav-link">
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="customer-actions">
          <span className="role-pill">{user.name}</span>
          <button className="btn btn-outline-secondary icon-button" onClick={onLogout}>
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </header>
      <main className="customer-content">
        <Outlet />
      </main>
    </div>
  );
}
