import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { clearStoredUser, getStoredUser, storeUser } from "./auth.js";
import AdminLayout from "./layouts/AdminLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";
import Alerts from "./pages/Alerts.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import CustomerCampaignDetail from "./pages/CustomerCampaignDetail.jsx";
import CustomerCampaigns from "./pages/CustomerCampaigns.jsx";
import CustomerDonationConfirmation from "./pages/CustomerDonationConfirmation.jsx";
import CustomerLookup from "./pages/CustomerLookup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DemoFlow from "./pages/DemoFlow.jsx";
import Login from "./pages/Login.jsx";
import TransactionDetail from "./pages/TransactionDetail.jsx";
import Transactions from "./pages/Transactions.jsx";

function LoginGate({ onLogin }) {
  const location = useLocation();
  return <Login onLogin={onLogin} redirectPath={location.state?.from?.pathname} />;
}

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      clearStoredUser();
    }
  }, [user]);

  const handleLogin = (nextUser, redirectPath) => {
    storeUser(nextUser);
    setUser(nextUser);
    navigate(redirectPath || (nextUser.role === "admin" ? "/admin" : "/customer"), { replace: true });
  };

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
    navigate("/", { replace: true });
  };

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginGate onLogin={handleLogin} />} />
      </Routes>
    );
  }

  if (user.role === "admin") {
    return (
      <Routes>
        <Route element={<AdminLayout user={user} onLogout={handleLogout} />}>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/campaigns" element={<Campaigns />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/transactions/:id" element={<TransactionDetail />} />
          <Route path="/admin/alerts" element={<Alerts />} />
          <Route path="/demo-flow" element={<DemoFlow />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<CustomerLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Navigate to="/customer" replace />} />
        <Route path="/customer" element={<CustomerCampaigns />} />
        <Route path="/customer/campaigns/:id" element={<CustomerCampaignDetail user={user} />} />
        <Route path="/customer/lookup" element={<CustomerLookup />} />
        <Route path="/customer/history" element={<CustomerLookup />} />
        <Route path="/customer/donations/:id" element={<CustomerDonationConfirmation />} />
        <Route path="*" element={<Navigate to="/customer" replace />} />
      </Route>
    </Routes>
  );
}
