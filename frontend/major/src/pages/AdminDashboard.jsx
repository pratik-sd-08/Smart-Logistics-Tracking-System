import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import API from "../api/axios";
import "../index.css";

const statusColors = {
  created: "#3498db",
  assigned: "#9b59b6",
  picked: "#f39c12",
  in_transit: "#e67e22",
  delivered: "#2ecc71",
  cancelled: "#e74c3c"
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    pickupLocation: { lat: "", lng: "" },
    deliveryLocation: { lat: "", lng: "" }
  });

  useEffect(() => {
    document.body.className = "admin-page";
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || res.data);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleOrderCreated = (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    };

    const handleStatusUpdated = (updatedOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    };

    socket.on("orderCreated", handleOrderCreated);
    socket.on("statusUpdated", handleStatusUpdated);

    return () => {
      socket.off("orderCreated", handleOrderCreated);
      socket.off("statusUpdated", handleStatusUpdated);
    };
  }, []);

  const handleCreateOrder = async () => {
    if (
      !form.customerName ||
      !form.pickupLocation.lat ||
      !form.pickupLocation.lng ||
      !form.deliveryLocation.lat ||
      !form.deliveryLocation.lng
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/orders", {
        customerName: form.customerName,
        pickupLocation: {
          lat: Number(form.pickupLocation.lat),
          lng: Number(form.pickupLocation.lng)
        },
        deliveryLocation: {
          lat: Number(form.deliveryLocation.lat),
          lng: Number(form.deliveryLocation.lng)
        }
      });

      setForm({
        customerName: "",
        pickupLocation: { lat: "", lng: "" },
        deliveryLocation: { lat: "", lng: "" }
      });

    } catch (error) {
      console.error(error);
      alert("Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="dashboard-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="glass-card">
        <h3>🚚 Place New Order</h3>

        <input
          className="input-field"
          placeholder="Customer Name"
          value={form.customerName}
          onChange={(e) =>
            setForm({ ...form, customerName: e.target.value })
          }
        />

        <input
          className="input-field"
          placeholder="Pickup Latitude"
          value={form.pickupLocation.lat}
          onChange={(e) =>
            setForm({
              ...form,
              pickupLocation: {
                ...form.pickupLocation,
                lat: e.target.value
              }
            })
          }
        />

        <input
          className="input-field"
          placeholder="Pickup Longitude"
          value={form.pickupLocation.lng}
          onChange={(e) =>
            setForm({
              ...form,
              pickupLocation: {
                ...form.pickupLocation,
                lng: e.target.value
              }
            })
          }
        />

        <input
          className="input-field"
          placeholder="Delivery Latitude"
          value={form.deliveryLocation.lat}
          onChange={(e) =>
            setForm({
              ...form,
              deliveryLocation: {
                ...form.deliveryLocation,
                lat: e.target.value
              }
            })
          }
        />

        <input
          className="input-field"
          placeholder="Delivery Longitude"
          value={form.deliveryLocation.lng}
          onChange={(e) =>
            setForm({
              ...form,
              deliveryLocation: {
                ...form.deliveryLocation,
                lng: e.target.value
              }
            })
          }
        />

        <button
          type="button"
          className="btn-primary"
          onClick={handleCreateOrder}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Order"}
        </button>
      </motion.div>

      <motion.div className="glass-card">
        <h3>📦 Orders</h3>

        {orders.length === 0 && <p>No orders found</p>}

        {orders.map((order) => (
          <div key={order._id} style={{ marginBottom: 15 }}>
            <strong>{order.customerName}</strong>

            <div
              style={{
                background: statusColors[order.status],
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 20,
                display: "inline-block",
                marginTop: 5
              }}
            >
              {order.status}
            </div>

            <p>Status: {order.status}</p>
            <hr />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
