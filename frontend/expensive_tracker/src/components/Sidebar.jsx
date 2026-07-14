import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Transactions", path: "/expenses", icon: "💳" },
    { name: "Budget", path: "/budget", icon: "📊" },
    { name: "Savings", path: "/savings", icon: "💰" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/");
  };

  return (
    <div style={{
      height: "100vh",
      width: "240px",
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      borderRight: "1px solid #e2e8f0",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <div style={{
          width: "34px", height: "34px",
          background: "#0ea5e9",
          borderRadius: "9px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px",
        }}>📊</div>
        <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", letterSpacing: "-0.3px" }}>
          Budget AI
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
        {menus.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "9px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: active ? "600" : "400",
                color: active ? "#0ea5e9" : "#64748b",
                background: active ? "#f0f9ff" : "transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: "17px" }}>{item.icon}</span>
              <span>{item.name}</span>
              {active && (
                <div style={{
                  marginLeft: "auto",
                  width: "5px", height: "5px",
                  borderRadius: "50%",
                  background: "#0ea5e9",
                }} />
              )}
            </Link>
          );
        })}

        {/* Admin Panel */}
        {isAdmin && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
            <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", letterSpacing: "0.8px", padding: "0 12px 6px", textTransform: "uppercase" }}>
              Admin
            </p>
            <Link
              to="/admin-dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "9px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: location.pathname === "/admin-dashboard" ? "600" : "400",
                color: location.pathname === "/admin-dashboard" ? "#0ea5e9" : "#64748b",
                background: location.pathname === "/admin-dashboard" ? "#f0f9ff" : "transparent",
                border: "1px solid",
                borderColor: location.pathname === "/admin-dashboard" ? "#bae6fd" : "#e2e8f0",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "17px" }}>🛡️</span>
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "9px",
          padding: "8px 12px", marginBottom: "6px",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "#f0f9ff", border: "1px solid #bae6fd",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "#0ea5e9",
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a", margin: 0 }}>{user?.username}</p>
            <p style={{ fontSize: "10px", color: "#94a3b8", margin: 0 }}>{user?.role || "USER"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 12px", borderRadius: "9px",
            border: "1px solid #fee2e2",
            background: "#fff5f5", color: "#ef4444",
            fontSize: "14px", fontWeight: "500", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff5f5"}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;