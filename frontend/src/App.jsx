import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Team from './pages/Team';
import Attendance from './pages/Attendance';
import Ratings from './pages/Ratings';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditLog from './pages/admin/AuditLog';
import Exports from './pages/admin/Exports';
import Departments from './pages/admin/Departments';
import InternOpsAssistant from './components/InternOpsAssistant';
import useAuthStore from './store/auth';
import api from './lib/axios';

function Private({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isManager = ['ADMIN', 'SENIOR_TL', 'TL', 'CAPTAIN'].includes(role);
  const canViewReports = ['ADMIN', 'SENIOR_TL'].includes(role);

  useEffect(() => {
    api
      .post('/auth/refresh')
      .then((res) =>
        setAuth({ accessToken: res.data.accessToken, user: res.data.user })
      )
      .catch(() => {})
      .finally(() => setHydrated());
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        element={
          <Private>
            <DashboardLayout />
          </Private>
        }
      >
        <Route index element={<Dashboard />} />
        {isManager && <Route path="team" element={<Team />} />}
        <Route path="attendance" element={<Attendance />} />
        <Route path="ratings" element={<Ratings />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="assistant" element={<InternOpsAssistant />} />
        {canViewReports && (
          <>
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="exports" element={<Exports />} />
          </>
        )}
        {isAdmin && (
          <>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="audit" element={<AuditLog />} />
          </>
        )}
      </Route>
    </Routes>
  );
}