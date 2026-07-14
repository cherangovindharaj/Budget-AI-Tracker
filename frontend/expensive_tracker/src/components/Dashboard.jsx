import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from "react";
import IncomeManager from "./IncomeManager";
import CommunityForum from './CommunityForum';
import AIExpenseDashboard from './AIExpenseDashboard';
import {
  Wallet, TrendingUp, TrendingDown, IndianRupee,
  PieChart as PieIcon, Trash2, Search, MessageSquare,
  Sparkles, X, Lightbulb, Activity, AlertTriangle, Zap, ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import SavingsDashboard from './SavingsDashboard';

const dynamicColors = [
  "#0ea5e9","#38bdf8","#7dd3fc","#0284c7","#0369a1",
  "#06b6d4","#67e8f9","#22d3ee","#0891b2","#0e7490"
];

// Arctic theme tokens
const C = {
  bg: "#f8fafc",
  white: "#ffffff",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  accent: "#0ea5e9",
  accentLight: "#f0f9ff",
  accentMid: "#bae6fd",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  green: "#059669",
  greenLight: "#d1fae5",
  red: "#dc2626",
  redLight: "#fee2e2",
  blue: "#2563eb",
  blueLight: "#dbeafe",
};

const card = {
  background: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: "12px",
  padding: "20px",
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showSavingsDashboard, setShowSavingsDashboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [totalIncome, setTotalIncome] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [showIncomeManager, setShowIncomeManager] = useState(false);
  const [showCommunityForum, setShowCommunityForum] = useState(false);
  const [aiWidgetOpen, setAiWidgetOpen] = useState(false);
  const [activeAITab, setActiveAITab] = useState('tips');
  const [showFullAIDashboard, setShowFullAIDashboard] = useState(false);
  const [stats, setStats] = useState({ totalExpenses: 0, categoryTotals: {} });

  const categories = ["Food","Transport","Shopping","Bills","Entertainment","Health","Education","Savings","Other"];

  const aiInsights = {
    tips: [
      stats.totalExpenses > 0 && Object.keys(stats.categoryTotals).length > 0
        ? `Your ${Object.keys(stats.categoryTotals).sort((a,b) => stats.categoryTotals[b]-stats.categoryTotals[a])[0]} spending is highest. Consider budgeting ₹${Math.round(stats.totalExpenses * 0.15)}/week.`
        : "Start tracking your expenses to get personalized tips!",
      totalIncome - stats.totalExpenses >= totalIncome * 0.2
        ? "Excellent! You're maintaining a healthy savings rate of over 20%."
        : "Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings.",
      expenses.length > 20
        ? "You have many transactions. Consider consolidating small purchases."
        : "Keep tracking your expenses regularly for better insights."
    ].filter(Boolean),
    alerts: [
      stats.totalExpenses > totalIncome * 0.7 && totalIncome > 0
        ? `You've spent ${((stats.totalExpenses/totalIncome)*100).toFixed(0)}% of your income this month` : null,
      stats.totalExpenses > totalIncome && totalIncome > 0 ? "⚠️ Warning: Expenses exceed income!" : null,
      expenses.length > 50 ? "High transaction volume detected this month" : null
    ].filter(Boolean),
    health: {
      status: totalIncome - stats.totalExpenses > totalIncome*0.2 ? "Excellent" : totalIncome - stats.totalExpenses > 0 ? "Good" : "Needs Attention",
      savingsRate: totalIncome > 0 ? (((totalIncome-stats.totalExpenses)/totalIncome)*100).toFixed(0) : 0,
      emoji: totalIncome - stats.totalExpenses > totalIncome*0.2 ? "😊" : totalIncome - stats.totalExpenses > 0 ? "😐" : "😟"
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (!token || !user) { window.location.href = "/"; return; }
    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);
    fetchExpenses(parsedUser.id);
    fetchIncomes(parsedUser.id);
  }, []);

  useEffect(() => { filterExpenses(); }, [expenses, searchTerm, filterCategory]);

  const fetchExpenses = async (userId) => {
    const res = await fetch(`${API_BASE_URL}/api/expenses/user/${userId}`);
    const data = await res.json();
    setExpenses(Array.isArray(data) ? data : []);
    calculateStats(Array.isArray(data) ? data : []);
    calculateMonthlySpending(Array.isArray(data) ? data : []);
  };

  const fetchIncomes = async (userId) => {
    const res = await fetch(`${API_BASE_URL}/api/incomes/user/${userId}`);
    const data = await res.json();
    setTotalIncome(data.reduce((s, i) => s + parseFloat(i.amount || 0), 0));
  };

  const calculateStats = (list) => {
    const total = list.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const categoryTotals = {};
    list.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount || 0); });
    setStats({ totalExpenses: total, categoryTotals });
  };

  const calculateMonthlySpending = (list) => {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const today = new Date();
    const months = [];
    const totals = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months.push({ key, label: names[d.getMonth()] });
      totals[key] = 0;
    }
    list.forEach(e => {
      if (e.expenseDate) {
        const d = new Date(e.expenseDate);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (totals.hasOwnProperty(key)) totals[key] += parseFloat(e.amount || 0);
      }
    });
    setMonthlyData(months.map(m => ({ month: m.label, spending: parseFloat(totals[m.key].toFixed(2)) })));
  };

  const filterExpenses = () => {
    let f = expenses;
    if (filterCategory !== "All") f = f.filter(e => e.category === filterCategory);
    if (searchTerm) f = f.filter(e => e.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredExpenses(f);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses(userData.id);
  };

  const barData = [{ name: "This Month", Income: totalIncome, Expenses: stats.totalExpenses }];
  const pieData = Object.entries(stats.categoryTotals).map(([name, value]) => ({ name, value }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const R = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    return (
      <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
        fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const cur = monthlyData.length > 0 ? monthlyData[monthlyData.length-1].spending : 0;
  const prev = monthlyData.length > 1 ? monthlyData[monthlyData.length-2].spending : 0;
  const pct = prev > 0 ? (((cur - prev) / prev) * 100).toFixed(0) : 0;

  const fmt = (v) => v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ background: C.accent, padding: "7px", borderRadius: "9px", display: "flex" }}>
          <Wallet size={18} color="white" />
        </div>
        <h1 style={{ fontSize: "17px", fontWeight: "700", color: C.text, margin: 0 }}>Budget AI</h1>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px" }}>
        {/* Welcome */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: C.text, margin: 0 }}>Welcome back, {userData?.username}! 👋</h2>
            <p style={{ color: C.textMuted, fontSize: "14px", margin: "4px 0 0" }}>Here's your financial overview</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowIncomeManager(true)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", background: C.accent, color: "white",
              border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
              <TrendingUp size={15} /> Manage Income
            </button>
            <button onClick={() => setShowCommunityForum(true)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", background: C.white, color: C.text,
              border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
              <MessageSquare size={15} /> Community
            </button>
            <button onClick={() => setShowSavingsDashboard(true)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", background: C.white, color: C.text,
              border: `1px solid ${C.border}`, borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
              📊 Savings
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
          {[
            { label: "Total Income", value: `₹${fmt(totalIncome)}`, color: C.green, bg: C.greenLight, icon: <TrendingUp size={18} color={C.green} /> },
            { label: "Total Expenses", value: `₹${fmt(stats.totalExpenses)}`, color: C.red, bg: C.redLight, icon: <TrendingDown size={18} color={C.red} /> },
            { label: "Balance", value: `₹${fmt(totalIncome - stats.totalExpenses)}`, color: C.accent, bg: C.accentLight, icon: <IndianRupee size={18} color={C.accent} /> },
            { label: "Transactions", value: expenses.length, color: "#7c3aed", bg: "#f5f3ff", icon: <PieIcon size={18} color="#7c3aed" /> },
          ].map((s, i) => (
            <div key={i} style={{ ...card, display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: "12px", color: C.textMuted, margin: "0 0 3px", fontWeight: "500" }}>{s.label}</p>
                <p style={{ fontSize: "18px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Spending */}
        <div style={{ ...card, marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "13px", color: C.textMuted, margin: "0 0 4px", fontWeight: "500" }}>Monthly Spending</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "26px", fontWeight: "700", color: C.text }}>₹{fmt(cur)}</span>
                <span style={{
                  fontSize: "12px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
                  background: pct >= 0 ? C.redLight : C.greenLight,
                  color: pct >= 0 ? C.red : C.green,
                }}>
                  {pct >= 0 ? "+" : ""}{pct}%
                </span>
              </div>
              <p style={{ fontSize: "12px", color: C.textMuted, margin: "3px 0 0" }}>Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderLight} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "13px" }}
                formatter={v => [`₹${fmt(parseFloat(v))}`, 'Spending']} />
              <Line type="monotone" dataKey="spending" stroke={C.accent} strokeWidth={2.5}
                dot={{ fill: C.accent, r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
          {/* Bar Chart */}
          <div style={card}>
            <p style={{ fontSize: "14px", fontWeight: "600", color: C.text, margin: "0 0 16px" }}>Income vs Expenses</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "13px" }}
                  formatter={v => `₹${fmt(parseFloat(v))}`} />
                <Bar dataKey="Income" fill={C.green} radius={[7,7,0,0]} />
                <Bar dataKey="Expenses" fill={C.red} radius={[7,7,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={card}>
            <p style={{ fontSize: "14px", fontWeight: "600", color: C.text, margin: "0 0 16px" }}>Spending by Category</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} labelLine={false} label={renderCustomLabel}>
                    {pieData.map((_, i) => <Cell key={i} fill={dynamicColors[i % dynamicColors.length]} stroke="white" strokeWidth={2} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={40}
                    formatter={(v, e) => <span style={{ fontSize: "12px", color: C.textSecondary }}>{v} ({((e.payload.value/stats.totalExpenses)*100).toFixed(1)}%)</span>}
                    iconType="circle" iconSize={8} />
                  <Tooltip contentStyle={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", fontSize: "13px" }}
                    formatter={(v, n) => [`₹${fmt(parseFloat(v))} (${((v/stats.totalExpenses)*100).toFixed(1)}%)`, n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "50px 0", color: C.textMuted }}>
                <p style={{ fontSize: "14px", fontWeight: "500" }}>No expenses yet</p>
                <p style={{ fontSize: "12px", marginTop: "4px" }}>Add expenses to see breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Expense List */}
        <div style={card}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: C.text, margin: "0 0 14px" }}>Recent Expenses</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
              <input type="text" placeholder="Search expenses..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 36px",
                  border: `1px solid ${C.border}`, borderRadius: "9px",
                  fontSize: "13px", color: C.text, background: C.white, outline: "none",
                }} />
            </div>
            <select onChange={e => setFilterCategory(e.target.value)}
              style={{
                padding: "9px 14px", border: `1px solid ${C.border}`, borderRadius: "9px",
                fontSize: "13px", color: C.text, background: C.white, outline: "none", cursor: "pointer",
              }}>
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {filteredExpenses.length > 0 ? filteredExpenses.map(exp => (
              <div key={exp.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 8px", borderBottom: `1px solid ${C.borderLight}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "9px",
                    background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", flexShrink: 0,
                  }}>
                    {exp.category === "Food" ? "🍔" : exp.category === "Transport" ? "🚗" : exp.category === "Shopping" ? "🛍️" : exp.category === "Bills" ? "📄" : exp.category === "Health" ? "💊" : exp.category === "Education" ? "📚" : exp.category === "Savings" ? "💰" : exp.category === "Entertainment" ? "🎬" : "📦"}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: C.text, margin: 0 }}>{exp.category}</p>
                    <p style={{ fontSize: "12px", color: C.textMuted, margin: "2px 0 0" }}>{exp.description || "No description"}</p>
                    <p style={{ fontSize: "11px", color: C.textMuted, margin: "1px 0 0" }}>
                      {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: C.red, margin: 0 }}>₹{parseFloat(exp.amount).toFixed(2)}</p>
                  <button onClick={() => handleDelete(exp.id)} style={{
                    width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${C.border}`,
                    background: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trash2 size={14} color={C.red} />
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted }}>
                <TrendingDown size={36} color={C.border} style={{ margin: "0 auto 8px", display: "block" }} />
                <p style={{ fontWeight: "500" }}>No expenses found</p>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showSavingsDashboard && userData && <SavingsDashboard userId={userData.id} onClose={() => setShowSavingsDashboard(false)} />}
      {showIncomeManager && userData && <IncomeManager userId={userData.id} onClose={() => setShowIncomeManager(false)} onIncomeAdded={() => fetchIncomes(userData.id)} />}
      {showCommunityForum && userData && <CommunityForum userData={userData} onClose={() => setShowCommunityForum(false)} />}
      {showFullAIDashboard && userData && <AIExpenseDashboard userData={userData} expenses={expenses} totalIncome={totalIncome} stats={stats} onClose={() => setShowFullAIDashboard(false)} />}

      {/* AI Widget */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 50 }}>
        {!aiWidgetOpen ? (
          <button onClick={() => setAiWidgetOpen(true)} style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: C.accent, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
          }}>
            <Sparkles size={22} color="white" />
            {aiInsights.alerts.length > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                background: C.red, color: "white", fontSize: "10px", fontWeight: "700",
                borderRadius: "50%", width: "18px", height: "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{aiInsights.alerts.length}</span>
            )}
          </button>
        ) : (
          <div style={{
            width: "340px", background: C.white, borderRadius: "16px",
            border: `1px solid ${C.border}`, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          }}>
            <div style={{ background: C.accent, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={18} color="white" />
                <div>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "white", margin: 0 }}>AI Assistant</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: 0 }}>Smart Financial Insights</p>
                </div>
              </div>
              <button onClick={() => setAiWidgetOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "7px", padding: "5px", cursor: "pointer", display: "flex" }}>
                <X size={16} color="white" />
              </button>
            </div>

            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
              {[
                { id: 'tips', label: 'Tips', icon: <Lightbulb size={13} />, badge: aiInsights.tips.length },
                { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={13} />, badge: aiInsights.alerts.length },
                { id: 'health', label: 'Health', icon: <Activity size={13} /> },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveAITab(t.id)} style={{
                  flex: 1, padding: "10px 6px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                  background: activeAITab === t.id ? C.white : C.bg,
                  color: activeAITab === t.id ? C.accent : C.textMuted,
                  borderBottom: activeAITab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
                  position: "relative",
                }}>
                  {t.icon}{t.label}
                  {t.badge > 0 && <span style={{ background: C.red, color: "white", fontSize: "9px", borderRadius: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>}
                </button>
              ))}
            </div>

            <div style={{ padding: "14px", maxHeight: "320px", overflowY: "auto" }}>
              {activeAITab === 'tips' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {aiInsights.tips.map((tip, i) => (
                    <div key={i} style={{ background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: "10px", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Zap size={16} color={C.accent} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ fontSize: "13px", color: C.text, margin: 0, lineHeight: "1.5" }}>{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeAITab === 'alerts' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {aiInsights.alerts.length > 0 ? aiInsights.alerts.map((a, i) => (
                    <div key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <AlertTriangle size={16} color="#f97316" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: "13px", color: C.text, margin: 0 }}>{a}</p>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted }}>
                      <p style={{ fontSize: "24px", margin: "0 0 6px" }}>✅</p>
                      <p style={{ fontWeight: "500", fontSize: "14px" }}>All Good!</p>
                      <p style={{ fontSize: "12px" }}>No spending alerts</p>
                    </div>
                  )}
                </div>
              )}
              {activeAITab === 'health' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: "36px", margin: "0 0 6px" }}>{aiInsights.health.emoji}</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: C.accent, margin: "0 0 2px" }}>{aiInsights.health.status}</p>
                    <p style={{ fontSize: "12px", color: C.textMuted, margin: 0 }}>Financial health</p>
                  </div>
                  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: C.textSecondary }}>Savings Rate</span>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: C.accent }}>{aiInsights.health.savingsRate}%</span>
                    </div>
                    <div style={{ background: C.borderLight, borderRadius: "4px", height: "6px" }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, aiInsights.health.savingsRate))}%`, height: "100%", background: C.accent, borderRadius: "4px" }} />
                    </div>
                    <p style={{ fontSize: "11px", color: C.textMuted, margin: "6px 0 0" }}>Target: 20% • {aiInsights.health.savingsRate >= 20 ? "Great job! 🎉" : "Keep going! 💪"}</p>
                  </div>
                  {[
                    { label: "Monthly Income", val: `₹${fmt(totalIncome)}` },
                    { label: "Total Expenses", val: `₹${fmt(stats.totalExpenses)}` },
                    { label: "Net Savings", val: `₹${fmt(totalIncome - stats.totalExpenses)}`, highlight: true },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: C.bg, borderRadius: "8px" }}>
                      <span style={{ fontSize: "13px", color: C.textSecondary }}>{r.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: r.highlight ? (totalIncome - stats.totalExpenses >= 0 ? C.green : C.red) : C.text }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
              <button onClick={() => { setAiWidgetOpen(false); setShowFullAIDashboard(true); }} style={{
                width: "100%", padding: "10px", background: C.accent, color: "white",
                border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>
                Open Full AI Dashboard <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;