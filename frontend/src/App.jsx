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

import { ProtectedRoute } from "./components/ProtectedRoute";

// Redirect root berdasarkan status login
function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

// Redirect dari /login kalau sudah login
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />
      {/* Guest-only */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />{" "}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Protected (harus login) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/events" element={<Events />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tags" element={<Tags />} />
        <Route path="/organizers" element={<Organizers />} />
        <Route path="/users" element={<Users />} />
      </Route>
      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
