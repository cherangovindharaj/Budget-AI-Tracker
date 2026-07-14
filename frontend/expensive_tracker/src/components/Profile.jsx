import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, IndianRupee, TrendingUp, TrendingDown, Edit, X, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IncomeManager from './IncomeManager';

const C = {
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  accent: "#0ea5e9", accentLight: "#f0f9ff", accentMid: "#bae6fd",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  green: "#059669", greenLight: "#d1fae5", greenBorder: "#a7f3d0",
  red: "#dc2626", redLight: "#fee2e2", redBorder: "#fecaca",
  blue: "#2563eb", blueLight: "#dbeafe", blueBorder: "#bfdbfe",
};

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [showIncomeManager, setShowIncomeManager] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!user) { navigate('/'); return; }
    try {
      const p = JSON.parse(user);
      setUserData(p);
      fetchExpenses(p.id);
      fetchIncomes(p.id);
    } catch { navigate('/'); }
  }, [navigate]);

  const fetchExpenses = async (id) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/expenses/user/${id}`);
      if (r.ok) { const d = await r.json(); setTotalExpenses(d.reduce((s, e) => s + parseFloat(e.amount || 0), 0)); }
    } catch {}
  };

  const fetchIncomes = async (id) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/incomes/user/${id}`);
      if (r.ok) { const d = await r.json(); setTotalIncome(d.reduce((s, i) => s + parseFloat(i.amount || 0), 0)); }
    } catch { setTotalIncome(0); }
  };

  const handleOpenEdit = () => {
    setEditForm({ username: userData.username, currentPassword: '', newPassword: '', confirmPassword: '' });
    setEditMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    setEditMessage({ type: '', text: '' });
    if (!editForm.username.trim()) { setEditMessage({ type: 'error', text: 'Username cannot be empty' }); return; }
    if (editForm.newPassword || editForm.currentPassword) {
      if (!editForm.currentPassword) { setEditMessage({ type: 'error', text: 'Please enter your current password' }); return; }
      if (editForm.newPassword.length < 6) { setEditMessage({ type: 'error', text: 'New password must be at least 6 characters' }); return; }
      if (editForm.newPassword !== editForm.confirmPassword) { setEditMessage({ type: 'error', text: 'New passwords do not match' }); return; }
    }
    setEditLoading(true);
    try {
      const payload = { username: editForm.username, ...(editForm.newPassword && { currentPassword: editForm.currentPassword, newPassword: editForm.newPassword }) };
      const r = await fetch(`${API_BASE_URL}/api/users/${userData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (r.ok) {
        const updated = { ...userData, username: editForm.username };
        sessionStorage.setItem('user', JSON.stringify(updated));
        localStorage.setItem('user', JSON.stringify(updated));
        setUserData(updated);
        setEditMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setShowEditModal(false), 1500);
      } else {
        const d = await r.json();
        setEditMessage({ type: 'error', text: d.message || 'Update failed. Try again.' });
      }
    } catch { setEditMessage({ type: 'error', text: 'Could not connect to server.' }); }
    finally { setEditLoading(false); }
  };

  const fmt = v => v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!userData) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "36px", height: "36px", border: `3px solid ${C.accentMid}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        <p style={{ color: C.textMuted, fontSize: "14px", marginTop: "12px" }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "40px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "28px 24px" }}>

        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} style={{
          display: "flex", alignItems: "center", gap: "6px",
          color: C.accent, background: "none", border: "none", cursor: "pointer",
          fontSize: "14px", fontWeight: "500", marginBottom: "20px", padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ background: C.white, borderRadius: "16px", border: `1px solid ${C.border}`, overflow: "hidden" }}>

          {/* Header Banner */}
          <div style={{ background: `linear-gradient(135deg, ${C.accent} 0%, #0284c7 100%)`, padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px", fontWeight: "700", color: "white",
                }}>
                  {userData.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: "22px", fontWeight: "700", color: "white", margin: "0 0 4px" }}>{userData.username}</h1>
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", margin: 0 }}>{userData.email}</p>
                  <span style={{
                    display: "inline-block", marginTop: "6px",
                    background: "rgba(255,255,255,0.2)", color: "white",
                    fontSize: "11px", fontWeight: "600", padding: "2px 10px", borderRadius: "20px",
                  }}>{userData.role || "USER"}</span>
                </div>
              </div>
              <button onClick={handleOpenEdit} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 18px", background: "white", color: C.accent,
                border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              }}>
                <Edit size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div style={{ padding: "20px 28px", borderBottom: `1px solid ${C.borderLight}`, background: C.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { icon: <User size={16} color={C.accent} />, bg: C.accentLight, label: "Username", value: userData.username },
                { icon: <Mail size={16} color="#2563eb" />, bg: C.blueLight, label: "Email", value: userData.email },
                { icon: <Shield size={16} color="#7c3aed" />, bg: "#f5f3ff", label: "Role", value: userData.role || "USER", badge: true },
              ].map((item, i) => (
                <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: C.textMuted, margin: "0 0 3px", fontWeight: "500" }}>{item.label}</p>
                    {item.badge
                      ? <span style={{ fontSize: "12px", fontWeight: "700", color: "#7c3aed", background: "#f5f3ff", padding: "2px 10px", borderRadius: "20px" }}>{item.value}</span>
                      : <p style={{ fontSize: "13px", fontWeight: "600", color: C.text, margin: 0 }}>{item.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Overview */}
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: C.text, margin: 0 }}>Financial Overview</h2>
              <button onClick={() => setShowIncomeManager(true)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", background: C.accent, color: "white",
                border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              }}>
                <TrendingUp size={14} /> Manage Income
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "Total Income", value: `₹${fmt(totalIncome)}`, color: C.green, bg: C.greenLight, border: C.greenBorder, icon: <IndianRupee size={16} color={C.green} /> },
                { label: "Total Expenses", value: `₹${fmt(totalExpenses)}`, color: C.red, bg: C.redLight, border: C.redBorder, icon: <TrendingDown size={16} color={C.red} /> },
                { label: "Balance", value: `₹${fmt(totalIncome - totalExpenses)}`, color: (totalIncome - totalExpenses) >= 0 ? C.blue : C.red, bg: (totalIncome - totalExpenses) >= 0 ? C.blueLight : C.redLight, border: (totalIncome - totalExpenses) >= 0 ? C.blueBorder : C.redBorder, icon: <IndianRupee size={16} color={(totalIncome - totalExpenses) >= 0 ? C.blue : C.red} /> },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "12px", padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: s.color }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Account Info */}
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: C.text, margin: "0 0 14px" }}>Account Information</h3>
              {[
                { label: "User ID", value: userData.id },
                { label: "Account Status", value: "Active", badge: true, badgeColor: C.green, badgeBg: C.greenLight },
                { label: "Member Since", value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.borderLight}` : "none" }}>
                  <span style={{ fontSize: "13px", color: C.textSecondary }}>{row.label}</span>
                  {row.badge
                    ? <span style={{ fontSize: "12px", fontWeight: "600", color: row.badgeColor, background: row.badgeBg, padding: "2px 12px", borderRadius: "20px" }}>{row.value}</span>
                    : <span style={{ fontSize: "13px", fontWeight: "600", color: C.text }}>{row.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: C.white, borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.text, margin: 0 }}>Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
                <X size={16} color={C.textSecondary} />
              </button>
            </div>

            {editMessage.text && (
              <div style={{
                padding: "10px 14px", borderRadius: "9px", marginBottom: "16px", fontSize: "13px", fontWeight: "500",
                display: "flex", alignItems: "center", gap: "8px",
                background: editMessage.type === 'success' ? C.greenLight : C.redLight,
                color: editMessage.type === 'success' ? C.green : C.red,
                border: `1px solid ${editMessage.type === 'success' ? C.greenBorder : C.redBorder}`,
              }}>
                {editMessage.type === 'success' ? <Check size={14} /> : '⚠️'} {editMessage.text}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Username</label>
                <input type="text" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "14px", color: C.text, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: "14px" }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 12px" }}>Change Password (Optional)</p>

                {[
                  { label: "Current Password", key: "currentPassword", show: showCurrentPw, toggle: () => setShowCurrentPw(!showCurrentPw) },
                  { label: "New Password", key: "newPassword", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>{f.label}</label>
                    <div style={{ position: "relative" }}>
                      <input type={f.show ? 'text' : 'password'} value={editForm[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                        style={{ width: "100%", padding: "10px 40px 10px 14px", border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "14px", color: C.text, outline: "none", boxSizing: "border-box" }} />
                      <button type="button" onClick={f.toggle} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textMuted, display: "flex" }}>
                        {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Confirm New Password</label>
                  <input type="password" value={editForm.confirmPassword} onChange={e => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    style={{ width: "100%", padding: "10px 14px", border: `1px solid ${editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword ? C.red : C.border}`, borderRadius: "9px", fontSize: "14px", color: C.text, outline: "none", boxSizing: "border-box" }} />
                  {editForm.confirmPassword && editForm.newPassword !== editForm.confirmPassword && (
                    <p style={{ fontSize: "11px", color: C.red, margin: "4px 0 0" }}>Passwords do not match</p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: "10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "14px", fontWeight: "600", color: C.textSecondary, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleEditSubmit} disabled={editLoading} style={{ flex: 1, padding: "10px", background: C.accent, border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "600", color: "white", cursor: "pointer", opacity: editLoading ? 0.7 : 1 }}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showIncomeManager && <IncomeManager userId={userData?.id} onClose={() => setShowIncomeManager(false)} onIncomeAdded={() => { fetchIncomes(userData.id); fetchExpenses(userData.id); }} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Profile;