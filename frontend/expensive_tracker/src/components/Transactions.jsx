import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Filter, TrendingDown, Calendar, X } from "lucide-react";

const C = {
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  accent: "#0ea5e9", accentLight: "#f0f9ff", accentMid: "#bae6fd",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  green: "#059669", greenLight: "#d1fae5", greenBorder: "#a7f3d0",
  red: "#dc2626", redLight: "#fee2e2", redBorder: "#fecaca",
  blue: "#2563eb", blueLight: "#dbeafe", blueBorder: "#bfdbfe",
  orange: "#ea580c", orangeLight: "#fff7ed",
};

const categoryColors = {
  Food:          { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  Transport:     { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  Shopping:      { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
  Bills:         { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  Entertainment: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Health:        { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  Education:     { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  Other:         { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

const categoryIcons = {
  Food:"🍔", Transport:"🚗", Shopping:"🛍️", Bills:"📄",
  Entertainment:"🎬", Health:"💊", Education:"📚", Other:"📌",
};

// ✅ Logic same - only UI changed
const Transactions = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null, amount: "", category: "",
    date: new Date().toISOString().split("T")[0], description: "",
  });
  const [userData, setUserData] = useState(null);

  const categories = ["Food","Transport","Shopping","Bills","Entertainment","Health","Education","Other"];

  useEffect(() => {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserData(parsed);
      fetchExpenses(parsed.id);
    } else fetchExpenses();
  }, []);

  const getId = (exp) => exp.id || exp._id || exp._doc?.id || exp._doc?._id;

  const fetchExpenses = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const url = userId ? `${API_BASE_URL}/api/expenses/user/${userId}` : `${API_BASE_URL}/api/expenses`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      if (!res.ok) { setExpenses([]); return; }
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch { setExpenses([]); }
  };

  const openAddModal = () => {
    setFormData({ id: null, amount: "", category: "", date: new Date().toISOString().split("T")[0], description: "" });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    const id = getId(expense);
    let expenseDate = expense.expenseDate || "";
    try {
      if (expenseDate) {
        if (typeof expenseDate === 'string' && expenseDate.includes("T")) expenseDate = expenseDate.split("T")[0];
        else { const d = new Date(expenseDate); expenseDate = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]; }
      } else expenseDate = new Date().toISOString().split("T")[0];
    } catch { expenseDate = new Date().toISOString().split("T")[0]; }
    setFormData({ id, amount: expense.amount?.toString() ?? "", category: expense.category ?? "", date: expenseDate, description: expense.description ?? "" });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) { alert("Please fill all required fields."); return; }
    const payload = { userId: userData?.id, amount: parseFloat(formData.amount), category: formData.category, date: formData.date, description: formData.description };
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
      if (isEditing && formData.id) {
        const res = await fetch(`${API_BASE_URL}/api/expenses/${formData.id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
        if (!res.ok) { alert("Failed to update expense: " + res.status); setSaving(false); return; }
        alert("✅ Expense updated successfully!");
      } else {
        const res = await fetch(`${API_BASE_URL}/api/expenses`, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!res.ok) { alert("Failed to add expense: " + res.status); setSaving(false); return; }
        alert("✅ Expense added successfully!");
      }
      setFormData({ id: null, amount: "", category: "", date: new Date().toISOString().split("T")[0], description: "" });
      setIsEditing(false); setShowModal(false); setSaving(false);
      fetchExpenses(userData?.id);
    } catch { alert("Network error while saving."); setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" } });
      if (!res.ok) { alert("Failed to delete item"); return; }
      alert("🗑️ Deleted successfully!");
      fetchExpenses(userData?.id);
    } catch { alert("Network error while deleting."); }
  };

  const filtered = expenses.filter(exp => {
    const matchSearch = (exp.category||"").toLowerCase().includes(search.toLowerCase()) || (exp.description||"").toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || exp.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalAmount = filtered.reduce((sum, e) => sum + (Number(e.amount)||0), 0);
  const totalCategories = new Set(filtered.map(e => e.category)).size;

  const inp = {
    width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
    borderRadius: "9px", fontSize: "14px", color: C.text, outline: "none",
    background: C.white, boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", background: C.accent, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingDown size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "700", color: C.text, margin: 0 }}>My Expenses</h1>
            <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>Track and manage your spending</p>
          </div>
        </div>
        <button onClick={openAddModal} style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "9px 18px", background: C.accent, color: "white",
          border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
        }}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>

        {/* Search & Filter */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", gap: "12px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <input type="text" placeholder="Search by category or description..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inp, paddingLeft: "36px" }} />
          </div>
          <div style={{ position: "relative" }}>
            <Filter size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              style={{ ...inp, width: "auto", paddingLeft: "34px", paddingRight: "14px", cursor: "pointer" }}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Total Expenses", value: filtered.length, sub: "Transactions", color: C.blue, bg: C.blueLight, border: C.blueBorder, icon: <TrendingDown size={18} color={C.blue} /> },
            { label: "Total Amount", value: `₹${totalAmount.toFixed(2)}`, sub: "Spent this period", color: C.red, bg: C.redLight, border: C.redBorder, icon: <span style={{ fontSize: "16px", fontWeight: "700", color: C.red }}>₹</span> },
            { label: "Categories", value: totalCategories, sub: "Active categories", color: C.accent, bg: C.accentLight, border: C.accentMid, icon: <Filter size={18} color={C.accent} /> },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: "0 0 3px", fontWeight: "500" }}>{s.label}</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: s.color, margin: "0 0 1px" }}>{s.value}</p>
                <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Expense List */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.borderLight}` }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: "0 0 2px" }}>All Expenses</h2>
            <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Your complete transaction history</p>
          </div>
          <div style={{ padding: "16px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <TrendingDown size={40} color={C.border} style={{ margin: "0 auto 10px", display: "block" }} />
                <p style={{ fontSize: "15px", fontWeight: "600", color: C.textSecondary, margin: "0 0 4px" }}>No expenses found</p>
                <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map(exp => {
                  const id = getId(exp);
                  const clr = categoryColors[exp.category] || categoryColors.Other;
                  const icon = categoryIcons[exp.category] || categoryIcons.Other;
                  return (
                    <div key={id} style={{
                      background: C.bg, border: `1px solid ${C.border}`,
                      borderRadius: "12px", padding: "14px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: clr.bg, border: `1px solid ${clr.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                          {icon}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: clr.color, background: clr.bg, border: `1px solid ${clr.border}`, padding: "2px 10px", borderRadius: "20px" }}>
                              {exp.category}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Calendar size={11} color={C.textMuted} />
                              <span style={{ fontSize: "12px", color: C.textMuted }}>
                                {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                              </span>
                            </div>
                          </div>
                          {exp.description && <p style={{ fontSize: "13px", color: C.textSecondary, margin: 0 }}>{exp.description}</p>}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: "9px", padding: "7px 14px", textAlign: "right" }}>
                          <p style={{ fontSize: "16px", fontWeight: "700", color: C.red, margin: 0 }}>₹{Number(exp.amount).toFixed(2)}</p>
                        </div>
                        <button onClick={() => handleEdit(exp)} style={{ width: "34px", height: "34px", borderRadius: "8px", background: C.blueLight, border: `1px solid ${C.blueBorder}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Edit2 size={14} color={C.blue} />
                        </button>
                        <button onClick={() => handleDelete(id)} style={{ width: "34px", height: "34px", borderRadius: "8px", background: C.redLight, border: `1px solid ${C.redBorder}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={14} color={C.red} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: C.white, borderRadius: "16px", width: "100%", maxWidth: "440px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ background: C.accent, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: "700", color: "white", margin: "0 0 2px" }}>
                  {isEditing ? "✏️ Edit Expense" : "➕ Add Expense"}
                </h2>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                  {isEditing ? "Update your transaction details" : "Record your new expense"}
                </p>
              </div>
              <button onClick={() => { setShowModal(false); setIsEditing(false); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
                <X size={18} color="white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { label: "Amount *", type: "number", placeholder: "100.00", step: "0.01", key: "amount", prefix: "₹" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: "700", color: C.textMuted }}>{f.prefix}</span>
                    <input type={f.type} step={f.step} placeholder={f.placeholder} value={formData[f.key]}
                      onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ ...inp, paddingLeft: "30px" }} required />
                  </div>
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Category *</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{ ...inp, cursor: "pointer" }} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Date *</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                  style={inp} required />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Description</label>
                <textarea placeholder="Add notes about this expense..." value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inp, resize: "none", height: "80px", paddingTop: "10px" }} rows={3} />
              </div>

              <button type="submit" disabled={saving} style={{
                width: "100%", padding: "11px", borderRadius: "9px",
                background: saving ? C.border : C.accent, color: "white",
                border: "none", fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
              }}>
                {saving ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    {isEditing ? "Updating..." : "Saving..."}
                  </span>
                ) : isEditing ? "💾 Update Expense" : "✅ Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Transactions;