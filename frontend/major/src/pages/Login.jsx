import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../index.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.body.className = "login-page";
  }, []);

  const handleSubmit = async () => {
    try {
      const role = await login(email, password);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "driver") {
        navigate("/driver");
      } else {
        navigate("/user");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <motion.div
      className="center-container"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ width: 350 }}
      >
        <h2 style={{ marginBottom: 20 }}>Smart Logistics</h2>

        <input
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
        >
          Login
        </button>

        <p style={{ marginTop: 20, textAlign: "center" }}>
          New user?
        </p>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/register")}
          style={{ marginTop: 10 }}
        >
          Create Account
        </button>
      </motion.div>
    </motion.div>
  );
}
