import { createContext, useState, useEffect } from "react";
import API from "../api/axios";
import { connectSocket, disconnectSocket } from "../socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    const token = res.data.token;
    localStorage.setItem("token", token);
    const decoded = JSON.parse(atob(token.split(".")[1]));

    setUser({ role: decoded.role });

   
    connectSocket();

    return decoded.role;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("token");

    disconnectSocket();
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));

      setUser({ role: decoded.role });

      connectSocket();
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
