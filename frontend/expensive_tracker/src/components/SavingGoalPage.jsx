import { API_BASE_URL } from '../config';
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Target, TrendingUp, Calendar, Trash2, PiggyBank, CheckCircle, X } from "lucide-react";

const API_BASE = `${API_BASE_URL}/api`;
const API = {
  list: (userId) => `${API_BASE}/saving-goals/user/${userId}`,
  create: () => `${API_BASE}/saving-goals`,
  addAmount: (id, amount) => `${API_BASE}/saving-goals/${id}/add?amount=${amount}`,
  remove: (id) => `${API_BASE}/saving-goals/${id}`,
};

const C = {
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  accent: "#0ea5e9", accentLight: "#f0f9ff", accentMid: "#bae6fd",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  green: "#059669", greenLight: "#d1fae5", greenBorder: "#a7f3d0",
  red: "#dc2626", redLight: "#fee2e2", redBorder: "#fecaca",
  blue: "#2563eb", blueLight: "#dbeafe", blueBorder: "#bfdbfe",
  orange: "#ea580c", orangeLight: "#fff7ed", orangeBorder: "#fed7aa",
  purple: "#7c3aed", purpleLight: "#f5f3ff", purpleBorder: "#ddd6fe",
};

const currency = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const inp = {
  width: "100%", padding: "10px 14px", border: `1px solid ${C.border}`,
  borderRadius: "9px", fontSize: "14px", color: C.text, outline: "none",
  background: C.white, boxSizing: "border-box",
};

// ✅ Logic same - only UI changed
const ProgressBar = ({ percent }) => (
  <div style={{ width: "100%", height: "7px", background: C.borderLight, borderRadius: "4px", overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(100, Math.max(0, percent))}%`, height: "100%",
      background: percent >= 100 ? C.green : C.accent,
      borderRadius: "4px", transition: "width 0.5s ease",
    }} />
  </div>
);

const AddGoalModal = ({ open, onClose, onCreate, userId }) => {
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setGoalName(""); setTarget(""); setDeadline(""); setInitial(""); }
  }, [open]);

  const disable = !goalName.trim() || !target || Number(target) <= 0 || !deadline;

  const handleSubmit = async () => {
    setSaving(true);
    const body = { userId, goalName: goalName.trim(), targetAmount: Number(target), savedAmount: initial && Number(initial) > 0 ? Number(initial) : 0, deadline };
    await onCreate(body);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "16px" }}>
      <div style={{ background: C.white, borderRadius: "16px", width: "100%", maxWidth: "460px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {/* Header */}
        <div style={{ background: C.accent, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", background: "rgba(255,255,255,0.2)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PiggyBank size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white", margin: "0 0 2px" }}>Add Saving Goal</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 }}>Create your financial target</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={16} color="white" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            { label: "Saving Name *", type: "text", placeholder: "e.g., New Phone, Emergency Fund", val: goalName, set: setGoalName },
            { label: "Deadline *", type: "date", placeholder: "", val: deadline, set: setDeadline },
          ].map((f, i) => (
            <div key={i}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} style={inp} />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: C.textSecondary, marginBottom: "6px" }}>Target Amount *</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: C.textMuted }}>₹</span>
              <input type="number" min="0" placeholder="25000" value={target} onChange={e => setTarget(e.target.value)} style={{ ...inp, paddingLeft: "28px" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: C.textSecondary }}>Initial Amount</label>
              <span style={{ fontSize: "11px", color: C.textMuted, background: C.bg, padding: "2px 8px", borderRadius: "10px" }}>Optional</span>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: C.textMuted }}>₹</span>
              <input type="number" min="0" placeholder="3000 (if you already have some)" value={initial} onChange={e => setInitial(e.target.value)} style={{ ...inp, paddingLeft: "28px" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "14px", fontWeight: "600", color: C.textSecondary, cursor: "pointer" }}>
              Cancel
            </button>
            <button disabled={disable || saving} onClick={handleSubmit} style={{
              flex: 1, padding: "10px", background: disable || saving ? C.border : C.accent,
              border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "700",
              color: "white", cursor: disable || saving ? "not-allowed" : "pointer",
            }}>
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Creating...
                </span>
              ) : "🎯 Create Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalCard = ({ g, onAddAmount, onDelete }) => {
  const percent = g.targetAmount ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
  const remaining = Math.max(0, (g.targetAmount || 0) - (g.savedAmount || 0));
  const [quickAmt, setQuickAmt] = useState("");
  const isCompleted = percent >= 100;

  return (
    <div style={{
      background: C.white,
      border: `1px solid ${isCompleted ? C.greenBorder : C.border}`,
      borderRadius: "14px", padding: "20px",
      background: isCompleted ? "#f0fdf4" : C.white,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: isCompleted ? C.greenLight : C.accentLight, border: `1px solid ${isCompleted ? C.greenBorder : C.accentMid}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {isCompleted ? <CheckCircle size={20} color={C.green} /> : <Target size={20} color={C.accent} />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: C.text, margin: 0 }}>{g.goalName}</h3>
              {isCompleted && <span style={{ fontSize: "11px", fontWeight: "700", color: C.green, background: C.greenLight, border: `1px solid ${C.greenBorder}`, padding: "2px 8px", borderRadius: "20px" }}>Completed! 🎉</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={12} color={C.textMuted} />
              <span style={{ fontSize: "12px", color: C.textMuted }}>
                Deadline: {g.deadline ? new Date(g.deadline).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(g.id)} style={{ width: "32px", height: "32px", background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trash2 size={14} color={C.red} />
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
        {[
          { label: "Target", value: currency(g.targetAmount), color: C.blue, bg: C.blueLight, border: C.blueBorder },
          { label: "Saved", value: currency(g.savedAmount), color: C.green, bg: C.greenLight, border: C.greenBorder },
          { label: "Remaining", value: currency(remaining), color: C.orange, bg: C.orangeLight, border: C.orangeBorder },
          { label: "Progress", value: `${Math.round(percent)}%`, color: C.accent, bg: C.accentLight, border: C.accentMid },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "10px", padding: "10px 12px" }}>
            <p style={{ fontSize: "10px", fontWeight: "600", color: s.color, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: "14px" }}>
        <ProgressBar percent={percent} />
      </div>

      {/* Add Amount */}
      {!isCompleted && (
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: C.textMuted, fontSize: "14px" }}>₹</span>
            <input type="number" min="0" placeholder="Add amount to save" value={quickAmt}
              onChange={e => setQuickAmt(e.target.value)}
              style={{ ...inp, paddingLeft: "28px" }} />
          </div>
          <button onClick={() => { if (!quickAmt || Number(quickAmt) <= 0) return; onAddAmount(g.id, Number(quickAmt)); setQuickAmt(""); }}
            style={{ padding: "10px 20px", background: C.green, color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            💰 Add
          </button>
        </div>
      )}
    </div>
  );
};

const SavingGoalPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const userId = user?.id;
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(API.list(userId));
      const data = await r.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch { setGoals([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [userId]);

  const totals = useMemo(() => {
    const totalGoals = goals.length;
    const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
    const totalSaved = goals.reduce((s, g) => s + (g.savedAmount || 0), 0);
    return { totalGoals, completed, totalSaved };
  }, [goals]);

  const createGoal = async (payload) => {
    try {
      const r = await fetch(API.create(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) { alert("Failed to create goal: " + r.status); return; }
      alert("✅ Saving goal created successfully!");
      setOpen(false);
      await load();
    } catch { alert("Network error while creating goal."); }
  };

  const addAmount = async (id, amount) => {
    try {
      const r = await fetch(API.addAmount(id, amount), { method: "PUT" });
      if (!r.ok) { alert("Failed to add amount: " + r.status); return; }
      alert("✅ Amount added successfully!");
      await load();
    } catch { alert("Network error while adding amount."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saving goal?")) return;
    try {
      const r = await fetch(API.remove(id), { method: "DELETE" });
      if (!r.ok) { alert("Failed to delete goal: " + r.status); return; }
      alert("🗑️ Saving goal deleted successfully!");
      await load();
    } catch { alert("Network error while deleting goal."); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "40px" }}>

      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 24px", position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", background: C.accent, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PiggyBank size={18} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: C.text, margin: 0 }}>Savings Goals</h2>
            <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>Create goals and track your progress</p>
          </div>
        </div>
        <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", background: C.accent, color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          <Plus size={15} /> Add Saving Goal
        </button>
      </div>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Total Goals", value: totals.totalGoals, color: C.blue, bg: C.blueLight, border: C.blueBorder, icon: <Target size={18} color={C.blue} /> },
            { label: "Completed Goals", value: totals.completed, color: C.green, bg: C.greenLight, border: C.greenBorder, icon: <CheckCircle size={18} color={C.green} /> },
            { label: "Total Saved", value: currency(totals.totalSaved), color: C.accent, bg: C.accentLight, border: C.accentMid, icon: <TrendingUp size={18} color={C.accent} /> },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: "0 0 3px", fontWeight: "500" }}>{s.label}</p>
                <p style={{ fontSize: "22px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "56px", textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", border: `3px solid ${C.accentMid}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: C.textSecondary, fontSize: "14px", fontWeight: "500", margin: 0 }}>Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "56px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <PiggyBank size={32} color={C.accent} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: C.text, margin: "0 0 6px" }}>No saving goals yet</h3>
            <p style={{ fontSize: "14px", color: C.textMuted, margin: "0 0 20px" }}>Start your savings journey by creating your first goal!</p>
            <button onClick={() => setOpen(true)} style={{ padding: "10px 24px", background: C.accent, color: "white", border: "none", borderRadius: "9px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
              🎯 Create Your First Goal
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {goals.map(g => <GoalCard key={g.id} g={g} onAddAmount={addAmount} onDelete={remove} />)}
          </div>
        )}
      </main>

      <AddGoalModal open={open} onClose={() => setOpen(false)} onCreate={createGoal} userId={userId} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SavingGoalPage;