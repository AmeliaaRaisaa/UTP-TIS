import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/categories/Categories";
import Events from "./pages/events/Events";
import Tags from "./pages/tags/Tags";
import Users from "./pages/users/Users";
import Organizers from "./pages/organizers/Organizers";
import Registrations from "./pages/registrations/Registrations";
import Profile from "./pages/profile/Profile";

import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";

// Tentukan halaman awal berdasarkan role
function getHomePath(role) {
  switch (role) {
    case 'admin':   return '/dashboard'
    case 'panitia': return '/dashboard'
    case 'peserta': return '/events'
    default:        return '/dashboard'
  }
}

// Redirect root berdasarkan status login
function RootRedirect() {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? getHomePath(user?.role) : "/login"} replace />;
}

// Redirect dari /login kalau sudah login
function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  return isAuthenticated
    ? <Navigate to={getHomePath(user?.role)} replace />
    : children;
}

// ProtectedRoute dengan role check sekaligus
function RoleProtectedRoute({ roles, children }) {
  return (
    <ProtectedRoute>
      <RoleRoute roles={roles}>{children}</RoleRoute>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Guest-only */}
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected — semua role yang sudah login */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard: admin & panitia saja (peserta di-redirect di dalam komponen) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Events: semua role */}
        <Route path="/events" element={<Events />} />

        {/* Profil: semua role */}
        <Route path="/profile" element={<Profile />} />

        {/* Categories: semua bisa lihat, create/edit/delete dikontrol di komponen */}
        <Route path="/categories" element={<Categories />} />

        {/* Tags: admin & panitia */}
        <Route path="/tags" element={<Tags />} />

        {/* Organizer profiles: admin & panitia */}
        <Route path="/organizers" element={<Organizers />} />

        {/* Registrasi: admin & panitia */}
        <Route path="/registrations" element={<Registrations />} />

        {/* Users: admin only */}
        <Route path="/users" element={<Users />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
