import { API_BASE_URL } from '../config';
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, TrendingUp, PiggyBank, Calendar, Award, Zap, X } from 'lucide-react';

const API_BASE = `${API_BASE_URL}/api`;

const C = {
  bg: "#f8fafc", white: "#ffffff", border: "#e2e8f0", borderLight: "#f1f5f9",
  accent: "#0ea5e9", accentLight: "#f0f9ff", accentMid: "#bae6fd",
  text: "#0f172a", textSecondary: "#64748b", textMuted: "#94a3b8",
  green: "#059669", greenLight: "#d1fae5", greenBorder: "#a7f3d0",
  red: "#dc2626", redLight: "#fee2e2",
  blue: "#2563eb", blueLight: "#dbeafe", blueBorder: "#bfdbfe",
  orange: "#ea580c", orangeLight: "#fff7ed", orangeBorder: "#fed7aa",
  purple: "#7c3aed", purpleLight: "#f5f3ff", purpleBorder: "#ddd6fe",
};

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: "14px",
  padding: "20px",
};

// ✅ Logic same - only UI/theme changed
const SavingsDashboard = ({ userId, onClose }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`${API_BASE}/saving-goals/user/${userId}`);
        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchGoals();
  }, [userId]);

  // ✅ Same logic
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalRemaining = totalTarget - totalSaved;
    const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
    const avgProgress = totalGoals > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return { totalGoals, totalTarget, totalSaved, totalRemaining, completed, avgProgress };
  }, [goals]);

  const pieData = goals.map(g => ({
    name: g.goalName, value: g.savedAmount,
    target: g.targetAmount, remaining: Math.max(0, g.targetAmount - g.savedAmount)
  }));

  const barData = goals.map(g => ({
    name: g.goalName.length > 10 ? g.goalName.substring(0, 10) + '...' : g.goalName,
    Saved: g.savedAmount, Target: g.targetAmount,
    Remaining: Math.max(0, g.targetAmount - g.savedAmount)
  }));

  const progressData = goals.map(g => ({
    name: g.goalName.length > 12 ? g.goalName.substring(0, 12) + '...' : g.goalName,
    progress: ((g.savedAmount / g.targetAmount) * 100).toFixed(1)
  }));

  const COLORS = [C.accent, C.green, C.purple, C.orange, C.blue, "#ec4899"];
  const currency = v => `₹${Number(v).toLocaleString('en-IN')}`;

  const tooltipStyle = {
    contentStyle: { background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "13px" }
  };

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: C.white, borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <div style={{ width: "40px", height: "40px", border: `3px solid ${C.accentMid}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: C.textSecondary, fontSize: "14px", fontWeight: "500", margin: 0 }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 50, overflowY: "auto" }}>
      <div style={{ minHeight: "100vh", padding: "28px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Header */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "48px", height: "48px", background: C.accent, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PiggyBank size={22} color="white" />
                </div>
                <div>
                  <h1 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: "0 0 3px" }}>Savings Dashboard</h1>
                  <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>Track your financial goals visually</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: "10px", padding: "10px 18px", textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: C.textMuted, margin: "0 0 2px", fontWeight: "500" }}>Overall Progress</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: C.accent, margin: 0 }}>{stats.avgProgress.toFixed(1)}%</p>
                </div>
                <button onClick={onClose} style={{
                  width: "36px", height: "36px", background: C.bg,
                  border: `1px solid ${C.border}`, borderRadius: "9px",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <X size={16} color={C.textSecondary} />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px" }}>
            {[
              { label: "Total Goals", value: stats.totalGoals, color: C.blue, bg: C.blueLight, border: C.blueBorder, icon: <Target size={18} color={C.blue} /> },
              { label: "Total Saved", value: currency(stats.totalSaved), color: C.green, bg: C.greenLight, border: C.greenBorder, icon: <TrendingUp size={18} color={C.green} /> },
              { label: "Remaining", value: currency(stats.totalRemaining), color: C.orange, bg: C.orangeLight, border: C.orangeBorder, icon: <Calendar size={18} color={C.orange} /> },
              { label: "Completed", value: stats.completed, color: C.purple, bg: C.purpleLight, border: C.purpleBorder, icon: <Award size={18} color={C.purple} /> },
            ].map((s, i) => (
              <div key={i} style={{ ...card, display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: C.textMuted, margin: "0 0 3px", fontWeight: "500" }}>{s.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

            {/* Pie Chart */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: C.purpleLight, border: `1px solid ${C.purpleBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>🍰</div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Savings Distribution</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={95} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={v => currency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: C.blueLight, border: `1px solid ${C.blueBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>📊</div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Goals Comparison</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={v => currency(v)} />
                  <Legend wrapperStyle={{ fontSize: "13px" }} />
                  <Bar dataKey="Saved" fill={C.green} radius={[6,6,0,0]} />
                  <Bar dataKey="Target" fill={C.accent} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>📈</div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Progress Tracking</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={v => `${v}%`} />
                  <Line type="monotone" dataKey="progress" stroke={C.accent} strokeWidth={2.5}
                    dot={{ fill: C.accent, r: 5, strokeWidth: 0 }} activeDot={{ r: 7, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal Bar */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", background: C.orangeLight, border: `1px solid ${C.orangeBorder}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>💰</div>
                <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Remaining to Save</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
                  <XAxis type="number" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} formatter={v => currency(v)} />
                  <Bar dataKey="Remaining" fill={C.orange} radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "32px", height: "32px", background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>📋</div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: C.text, margin: 0 }}>Goals Summary</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {["Goal Name", "Target", "Saved", "Remaining", "Progress"].map(h => (
                      <th key={h} style={{
                        textAlign: h === "Goal Name" ? "left" : h === "Progress" ? "center" : "right",
                        padding: "11px 16px", fontSize: "11px", fontWeight: "600",
                        color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal, idx) => {
                    const progress = ((goal.savedAmount / goal.targetAmount) * 100).toFixed(1);
                    return (
                      <tr key={goal.id} style={{
                        borderBottom: `1px solid ${C.borderLight}`,
                        background: idx % 2 === 0 ? C.white : C.bg,
                      }}>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: C.text }}>{goal.goalName}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: C.blue, textAlign: "right" }}>{currency(goal.targetAmount)}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: C.green, textAlign: "right" }}>{currency(goal.savedAmount)}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: C.orange, textAlign: "right" }}>
                          {currency(Math.max(0, goal.targetAmount - goal.savedAmount))}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, background: C.borderLight, borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                              <div style={{
                                width: `${Math.min(100, progress)}%`, height: "100%",
                                background: parseFloat(progress) >= 100 ? C.green : C.accent,
                                borderRadius: "4px", transition: "width 0.5s ease",
                              }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: parseFloat(progress) >= 100 ? C.green : C.accent, minWidth: "40px", textAlign: "right" }}>
                              {progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SavingsDashboard;