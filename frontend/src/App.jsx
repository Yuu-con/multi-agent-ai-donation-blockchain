import { AlertTriangle, BarChart3, Flag, GitBranch, HandCoins, LayoutDashboard } from "lucide-react";
import { NavLink, Route, Routes } from "react-router-dom";

import Alerts from "./pages/Alerts.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DemoFlow from "./pages/DemoFlow.jsx";
import TransactionDetail from "./pages/TransactionDetail.jsx";
import Transactions from "./pages/Transactions.jsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaigns", icon: HandCoins },
  { to: "/transactions", label: "Transactions", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/demo-flow", label: "Demo Flow", icon: GitBranch },
];

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Flag size={22} />
          <span>Donation AI</span>
        </div>
        <nav className="nav flex-column gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className="nav-link">
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/demo-flow" element={<DemoFlow />} />
        </Routes>
      </main>
    </div>
  );
}
