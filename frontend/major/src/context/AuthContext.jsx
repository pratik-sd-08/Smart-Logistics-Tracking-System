import { createContext, useState, useEffect } from "react";
import API from "../api/axios";
import socket, { connectSocket, disconnectSocket } from "../socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);

    setUser({ role: res.data.role });

    connectSocket();

    return res.data.role;
  };


  const logout = async () => {
    await API.post("/auth/logout");

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
    } catch (error) {
      localStorage.removeItem("token");
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
