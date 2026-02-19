import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import "../index.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showDrivers, setShowDrivers] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const fetchDrivers = async () => {
    try {
      const res = await API.get("/auth/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const assignDriver = async (orderId, driverId) => {
    if (!driverId) return;

    try {
      await API.put(`/orders/update/${orderId}`, {
        assignedDriver: driverId,
        status: "assigned"
      });

      await fetchOrders();
      alert("Driver Assigned Successfully");
    } catch (error) {
      console.error("Driver assignment failed:", error);
      alert("Driver assignment failed");
    }
  };

  useEffect(() => {
    if (showDrivers) {
      fetchDrivers();
      fetchOrders();
    }
  }, [showDrivers]);

  return (
    <>

      <div className="navbar">
        <h3
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          🚚 Smart Logistics
        </h3>

        <div style={{ display: "flex", gap: 15 }}>

          {user?.role === "admin" && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate("/admin")}
              >
                Place Order
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowDrivers(true)}
              >
                Drivers
              </button>
            </>
          )}

          {user?.role === "user" && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/user")}
            >
              My Orders
            </button>
          )}

          {user && (
            <button
              type="button"
              className="btn-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {showDrivers && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="glass-card"
            style={{ width: 600 }}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
          >
            <h3>Driver Management</h3>

            <h4>Drivers</h4>
            {drivers.map((driver) => (
              <div key={driver._id}>
                <strong>{driver.name}</strong>
                <p>{driver.email}</p>
                <hr />
              </div>
            ))}

            <h4>Assign Driver To Order</h4>

            {orders.map((order) => (
              <div key={order._id} style={{ marginBottom: 10 }}>
                <strong>{order.customerName}</strong>
                <p>Status: {order.status}</p>

                <select
                  className="input-field"
                  defaultValue=""
                  onChange={(e) =>
                    assignDriver(order._id, e.target.value)
                  }
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowDrivers(false)}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
