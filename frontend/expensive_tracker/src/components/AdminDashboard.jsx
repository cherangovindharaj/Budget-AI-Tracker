import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import {
  Users, IndianRupee, TrendingUp, Shield, LogOut,
  Trash2, User as UserIcon, Search, Eye, X, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const C = {
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  accent: "#0ea5e9", accentLight: "#f0f9ff", accentMid: "#bae6fd",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  green: "#059669", greenLight: "#d1fae5", greenBorder: "#a7f3d0",
  red: "#dc2626", redLight: "#fee2e2", redBorder: "#fecaca",
  blue: "#2563eb", blueLight: "#dbeafe", blueBorder: "#bfdbfe",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userExpenses, setUserExpenses] = useState({});
  const [userIncomes, setUserIncomes] = useState({});
  const [loadingExpenses, setLoadingExpenses] = useState({});
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalAmount: 0 });

  useEffect(() => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) setAdminData(JSON.parse(user));
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (!res.ok) return;
      const usersData = await res.json();
      setUsers(usersData);
      let totalTransactions = 0, totalAmount = 0;
      for (const u of usersData) {
        try {
          const r = await fetch(`${API_BASE_URL}/api/expenses/user/${u.id}`);
          if (r.ok) {
            const ex = await r.json();
            totalTransactions += ex.length;
            totalAmount += ex.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
          }
        } catch {}
      }
      setStats({ totalUsers: usersData.length, totalTransactions, totalAmount });
    } catch (e) { console.error(e); }
  };

  const handleExpandUser = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    if (!userExpenses[userId]) {
      setLoadingExpenses(p => ({ ...p, [userId]: true }));
      try {
        const [eR, iR] = await Promise.all([
          fetch(`${API_BASE_URL}/api/expenses/user/${userId}`),
          fetch(`${API_BASE_URL}/api/incomes/user/${userId}`)
        ]);
        // ✅ Fix: parse JSON first, then set state
        if (eR.ok) {
          const expenses = await eR.json();
          setUserExpenses(p => ({ ...p, [userId]: expenses }));
        }
        if (iR.ok) {
          const incomes = await iR.json();
          setUserIncomes(p => ({ ...p, [userId]: incomes }));
        }
      } catch {}
      finally { setLoadingExpenses(p => ({ ...p, [userId]: false })); }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const r = await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
      if (r.ok) { fetchAllUsers(); if (expandedUser === userId) setExpandedUser(null); }
    } catch {}
  };

  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; };

  const fmt = v => v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: C.accent, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", color: C.text, margin: 0 }}>Admin Dashboard</h1>
            <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>Budget AI Management</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Back to User Dashboard */}
          <button onClick={() => navigate('/dashboard')} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", background: C.accentLight, color: C.accent,
            border: `1px solid ${C.accentMid}`, borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}>
            <ArrowLeft size={14} /> User Dashboard
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "9px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: C.accentLight, border: `1px solid ${C.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: C.accent }}>
              {adminData?.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{adminData?.username || 'Admin'}</span>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", background: C.redLight, color: C.red,
            border: `1px solid ${C.redBorder}`, borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Welcome */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: C.text, margin: "0 0 4px" }}>Welcome back, {adminData?.username || 'Admin'}! 👋</h2>
          <p style={{ fontSize: "14px", color: C.textMuted, margin: 0 }}>Manage users and monitor system activity</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            { label: "Total Users", value: stats.totalUsers, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: <Users size={20} color="#7c3aed" /> },
            { label: "Total Transactions", value: stats.totalTransactions, color: C.green, bg: C.greenLight, border: C.greenBorder, icon: <TrendingUp size={20} color={C.green} /> },
            { label: "Total Amount Tracked", value: `₹${fmt(stats.totalAmount)}`, color: C.accent, bg: C.accentLight, border: C.accentMid, icon: <IndianRupee size={20} color={C.accent} /> },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "24px", fontWeight: "700", color: s.color, margin: "0 0 2px" }}>{s.value}</p>
                <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User Table */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden" }}>

          {/* Table Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 2px" }}>User Management</h3>
              <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>View and manage all registered users</p>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
              <input
                type="text" placeholder="Search users..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: "8px 12px 8px 32px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", color: C.text, outline: "none", width: "220px", background: C.bg }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <X size={13} color={C.textMuted} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["ID", "Username", "Email", "Role", "Actions"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: "12px", fontWeight: "600", color: C.textMuted, letterSpacing: "0.4px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: C.textMuted, fontSize: "14px" }}>No users found</td></tr>
                ) : filteredUsers.map((user, idx) => (
                  <React.Fragment key={user.id}>
                    <tr style={{ borderBottom: `1px solid ${C.borderLight}`, background: expandedUser === user.id ? C.accentLight : idx % 2 === 0 ? C.white : C.bg }}>
                      <td style={{ padding: "13px 16px", fontSize: "13px", color: C.textMuted, fontWeight: "500" }}>{user.id}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.accentLight, border: `1px solid ${C.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: C.accent, flexShrink: 0 }}>
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{user.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: "13px", color: C.textSecondary }}>{user.email}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px",
                          background: user.role === 'ADMIN' ? "#fef3c7" : C.accentLight,
                          color: user.role === 'ADMIN' ? "#d97706" : C.accent,
                          border: `1px solid ${user.role === 'ADMIN' ? "#fde68a" : C.accentMid}`,
                        }}>{user.role}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleExpandUser(user.id)} style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "6px 12px", background: C.accentLight, color: C.accent,
                            border: `1px solid ${C.accentMid}`, borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                          }}>
                            <Eye size={13} />
                            {expandedUser === user.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button onClick={() => handleDeleteUser(user.id)} style={{
                              display: "flex", alignItems: "center", gap: "5px",
                              padding: "6px 12px", background: C.redLight, color: C.red,
                              border: `1px solid ${C.redBorder}`, borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                            }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan={5} style={{ padding: "16px 20px", background: C.accentLight, borderBottom: `1px solid ${C.accentMid}` }}>
                          {loadingExpenses[user.id] ? (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                              <div style={{ width: "28px", height: "28px", border: `3px solid ${C.accentMid}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 8px" }} />
                              <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Loading user data...</p>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "14px" }}>
                                {[
                                  { label: "Total Income", value: `₹${fmt((userIncomes[user.id]||[]).reduce((s,i)=>s+parseFloat(i.amount||0),0))}`, color: C.green, bg: C.white, border: C.greenBorder },
                                  { label: "Total Expenses", value: `₹${fmt((userExpenses[user.id]||[]).reduce((s,e)=>s+parseFloat(e.amount||0),0))}`, color: C.red, bg: C.white, border: C.redBorder },
                                  { label: "Transactions", value: (userExpenses[user.id]||[]).length, color: C.accent, bg: C.white, border: C.accentMid },
                                ].map((s,i) => (
                                  <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "10px", padding: "12px 16px" }}>
                                    <p style={{ fontSize: "11px", color: C.textMuted, margin: "0 0 4px" }}>{s.label}</p>
                                    <p style={{ fontSize: "18px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
                                  </div>
                                ))}
                              </div>

                              <h4 style={{ fontSize: "13px", fontWeight: "600", color: C.text, margin: "0 0 8px" }}>Recent Expenses</h4>
                              {(userExpenses[user.id]||[]).length === 0 ? (
                                <p style={{ fontSize: "13px", color: C.textMuted, textAlign: "center", padding: "16px 0" }}>No expenses found</p>
                              ) : (
                                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
                                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                      <tr style={{ background: C.bg }}>
                                        {["Category","Description","Amount","Date"].map(h => (
                                          <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: "11px", fontWeight: "600", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(userExpenses[user.id]||[]).slice(0,5).map(exp => (
                                        <tr key={exp.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                                          <td style={{ padding: "9px 14px", fontSize: "13px", fontWeight: "600", color: C.text }}>{exp.category}</td>
                                          <td style={{ padding: "9px 14px", fontSize: "13px", color: C.textSecondary }}>{exp.description || '-'}</td>
                                          <td style={{ padding: "9px 14px", fontSize: "13px", fontWeight: "700", color: C.red }}>₹{parseFloat(exp.amount).toFixed(2)}</td>
                                          <td style={{ padding: "9px 14px", fontSize: "12px", color: C.textMuted }}>{exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('en-IN') : '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {(userExpenses[user.id]||[]).length > 5 && (
                                    <p style={{ textAlign: "center", padding: "8px", fontSize: "12px", color: C.textMuted, margin: 0 }}>
                                      Showing 5 of {userExpenses[user.id].length} expenses
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;