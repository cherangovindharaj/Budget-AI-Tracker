import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import SavingGoalPage from "./components/SavingGoalPage";
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Transactions from './components/Transactions';
import BudgetPage from './components/BudgetPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // ✅ Role track pannrom
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role); // ✅ Role set pannrom
    }

    setLoading(false);

    const handleLogin = () => {
      setIsAuthenticated(true);
      const u = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (u) {
        const parsedUser = JSON.parse(u);
        setUserRole(parsedUser.role); // ✅ Login aana udane role set
      }
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/');
    };

    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ Role based home redirect
  const getHomeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/" />;
    if (userRole === 'ADMIN') return <Navigate to="/admin-dashboard" />;
    return <Navigate to="/dashboard" />;
  };

  return (
    <Routes>
      {/* ✅ Login page - admin login pannina admin dashboard, user login pannina dashboard */}
      <Route
        path="/"
        element={
          !isAuthenticated
            ? <AuthPage />
            : userRole === 'ADMIN'
            ? <Navigate to="/admin-dashboard" />
            : <Navigate to="/dashboard" />
        }
      />

      {/* ✅ Admin Dashboard - NO DashboardLayout, own header irukku */}
      <Route
        path="/admin-dashboard"
        element={
          !isAuthenticated
            ? <Navigate to="/" />
            : userRole === 'ADMIN'
            ? <AdminDashboard />
            : <Navigate to="/dashboard" />
        }
      />

      {/* ✅ Normal User Routes - ADMIN also can access */}
      <Route
        path="/dashboard"
        element={
          !isAuthenticated
            ? <Navigate to="/" />
            : <DashboardLayout><Dashboard /></DashboardLayout>
        }
      />

      <Route
        path="/expenses"
        element={isAuthenticated ? <DashboardLayout><Transactions /></DashboardLayout> : <Navigate to="/" />}
      />

      <Route
        path="/budget"
        element={isAuthenticated ? <DashboardLayout><BudgetPage /></DashboardLayout> : <Navigate to="/" />}
      />

      <Route
        path="/profile"
        element={isAuthenticated ? <DashboardLayout><Profile /></DashboardLayout> : <Navigate to="/" />}
      />

      <Route
        path="/savings"
        element={isAuthenticated ? <DashboardLayout><SavingGoalPage /></DashboardLayout> : <Navigate to="/" />}
      />

      <Route path="*" element={getHomeRedirect()} />
    </Routes>
  );
}

export default App;