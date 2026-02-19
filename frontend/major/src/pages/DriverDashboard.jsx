import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import API from "../api/axios";
import "../index.css";

const socket = io("http://localhost:5000", {
  withCredentials: true
});

const statusProgress = {
  assigned: "25%",
  picked: "50%",
  in_transit: "75%",
  delivered: "100%"
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [otpInput, setOtpInput] = useState("");
  const [locationActive, setLocationActive] = useState(false);

  /* 🔥 ADD DRIVER PAGE BACKGROUND */
  useEffect(() => {
    document.body.className = "driver-page";
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || res.data);
    } catch (error) {
      console.error("Failed to fetch driver orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleStatusUpdate = (updatedOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    socket.on("statusUpdated", handleStatusUpdate);

    return () => {
      socket.off("statusUpdated", handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          socket.emit("driverLocation", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });

          setLocationActive(true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationActive(false);
        },
        {
          enableHighAccuracy: true
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/status/${id}`, { status });
    } catch (error) {
      alert("Status update failed");
    }
  };

  const verifyOTP = async (id) => {
    try {
      await API.put(`/orders/status/${id}`, {
        status: "delivered",
        otp: otpInput
      });
      setOtpInput("");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <motion.div
      className="dashboard-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="glass-card">

        <h2>🚚 Driver Dashboard</h2>

        <p>
          Location Tracking:{" "}
          <strong style={{ color: locationActive ? "green" : "red" }}>
            {locationActive ? "Active" : "Inactive"}
          </strong>
        </p>

        {orders.length === 0 && <p>No assigned orders</p>}

        {orders.map(order => (
          <div key={order._id} style={{ marginBottom: 25 }}>

            <strong>{order.customerName}</strong>

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: statusProgress[order.status] || "0%"
              }}
              transition={{ duration: 0.5 }}
              style={{
                height: 8,
                background: "#2ecc71",
                borderRadius: 5,
                marginTop: 10
              }}
            />

            <p>Status: {order.status}</p>
            <p><b>Pickup:</b> {order.pickupAddress}</p>
            <p><b>Drop:</b> {order.dropAddress}</p>

            {order.status === "assigned" && (
              <button
                className="btn-primary"
                onClick={() => updateStatus(order._id, "picked")}
              >
                Mark Picked
              </button>
            )}

            {order.status === "picked" && (
              <button
                className="btn-primary"
                onClick={() => updateStatus(order._id, "in_transit")}
              >
                Start Delivery
              </button>
            )}

            {order.status === "in_transit" && (
              <>
                <input
                  className="input-field"
                  placeholder="Enter Delivery OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />

                <button
                  className="btn-primary"
                  onClick={() => verifyOTP(order._id)}
                >
                  Complete Delivery
                </button>
              </>
            )}

            <hr />
          </div>
        ))}

      </motion.div>
    </motion.div>
  );
}
