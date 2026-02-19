import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { useContext } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function AnimatedRoutes() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;   

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route
          path="/"
          element={
            user
              ? user.role === "admin"
                ? <Navigate to="/admin" replace />
                : user.role === "driver"
                ? <Navigate to="/driver" replace />
                : <Navigate to="/user" replace />
              : <Login />
          }
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" replace />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver"
          element={
            <ProtectedRoute role="driver">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;  

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
