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

export default function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [total, setTotal] = useState(0);

  const ordersPerPage = 5;

  const [form, setForm] = useState({
    customerName: "",
    senderName: "",
    senderContact: "",
    pickupAddress: "",
    receiverName: "",
    receiverContact: "",
    dropAddress: ""
  });

  /* ================= SOCKET LISTENERS ================= */

  useEffect(() => {
    socket.on("orderCreated", (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on("statusUpdated", (updatedOrder) => {
      setOrders(prev =>
        prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("orderCreated");
      socket.off("statusUpdated");
    };
  }, []);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    const res = await API.get(
      `/orders?page=${currentPage}&limit=${ordersPerPage}`
    );

    if (res.data.orders) {
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } else {
      setOrders(res.data);
      setTotal(res.data.length);
    }
  };

  /* ================= CREATE ORDER ================= */

  const createOrder = async () => {
    await API.post("/orders", {
      ...form,
      pickupLocation: { lat: 0, lng: 0 },
      deliveryLocation: { lat: 0, lng: 0 }
    });

    setForm({
      customerName: "",
      senderName: "",
      senderContact: "",
      pickupAddress: "",
      receiverName: "",
      receiverContact: "",
      dropAddress: ""
    });

    fetchOrders();
  };

  /* ================= DELETE ORDER ================= */

  const deleteOrder = async (id) => {
    await API.delete(`/orders/${id}`);
    fetchOrders();
  };

  /* ================= UPDATE ORDER ================= */

  const updateOrder = async () => {
    await API.put(`/orders/update/${editingOrder._id}`, editingOrder);
    setEditingOrder(null);
    fetchOrders();
  };

  /* ================= VERIFY OTP ================= */

  const verifyOTP = async (id) => {
    await API.put(`/orders/status/${id}`, {
      status: "delivered",
      otp: otpInput
    });
    setOtpInput("");
  };

  /* ================= EXPORT CSV ================= */

  const exportCSV = () => {
    const headers = [
      "Customer Name",
      "Sender Name",
      "Sender Contact",
      "Receiver Name",
      "Receiver Contact",
      "Pickup Address",
      "Drop Address",
      "Status"
    ];

    const rows = orders.map(order => [
      order.customerName,
      order.senderName,
      order.senderContact,
      order.receiverName,
      order.receiverContact,
      order.pickupAddress,
      order.dropAddress,
      order.status
    ]);

    const csvContent =
      [headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "orders.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= FILTER ================= */

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / ordersPerPage);

  return (
    <motion.div
      className="dashboard-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* ================= CREATE ORDER ================= */}

      <motion.div className="glass-card">
        <h3>Create Order</h3>

        {Object.keys(form).map((key) => (
          <input
            key={key}
            className="input-field"
            placeholder={key.replace(/([A-Z])/g, " $1")}
            value={form[key]}
            onChange={(e) =>
              setForm({ ...form, [key]: e.target.value })
            }
          />
        ))}

        <button className="btn-primary" onClick={createOrder}>
          Create
        </button>
      </motion.div>

      {/* ================= ORDER LIST ================= */}

      <motion.div className="glass-card">
        <h3>Your Orders</h3>

        <button
          className="btn-secondary"
          onClick={exportCSV}
          style={{ marginBottom: 10 }}
        >
          Export CSV
        </button>

        <input
          className="input-field"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredOrders.map((order) => (
          <div key={order._id} style={{ marginBottom: 20 }}>

            <strong>{order.customerName}</strong>

            <motion.div
              initial={{ width: 0 }}
              animate={{
                width:
                  order.status === "created" ? "20%" :
                  order.status === "assigned" ? "40%" :
                  order.status === "picked" ? "60%" :
                  order.status === "in_transit" ? "80%" :
                  order.status === "delivered" ? "100%" : "0%"
              }}
              transition={{ duration: 0.5 }}
              style={{
                height: 8,
                background: statusColors[order.status],
                borderRadius: 5,
                marginTop: 8
              }}
            />

            <p><b>Status:</b> {order.status}</p>

            <p><b>Sender:</b> {order.senderName} ({order.senderContact})</p>
            <p><b>Receiver:</b> {order.receiverName} ({order.receiverContact})</p>
            <p><b>Pickup:</b> {order.pickupAddress}</p>
            <p><b>Drop:</b> {order.dropAddress}</p>

            {/* 🔥 SHOW OTP TO CUSTOMER */}
            {order.status === "in_transit" && order.deliveryOTP && (
              <div style={{ marginTop: 10 }}>
                <h4>Delivery OTP:</h4>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    background: "#111",
                    color: "#fff",
                    padding: 10,
                    borderRadius: 8,
                    display: "inline-block"
                  }}
                >
                  {order.deliveryOTP}
                </div>
              </div>
            )}

            <ul>
              <li>Created</li>
              {order.status !== "created" && <li>Assigned</li>}
              {["picked","in_transit","delivered"].includes(order.status) && <li>Picked</li>}
              {["in_transit","delivered"].includes(order.status) && <li>In Transit</li>}
              {order.status === "delivered" && <li>Delivered</li>}
            </ul>

            {order.status === "in_transit" && (
              <>
                <input
                  className="input-field"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
                <button
                  className="btn-primary"
                  onClick={() => verifyOTP(order._id)}
                >
                  Verify OTP
                </button>
              </>
            )}

            <button
              className="btn-secondary"
              onClick={() => setEditingOrder(order)}
            >
              Edit
            </button>

            <button
              className="btn-secondary"
              onClick={() => deleteOrder(order._id)}
              style={{ marginLeft: 10 }}
            >
              Delete
            </button>

            <hr />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className="btn-secondary"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>

      </motion.div>

    </motion.div>
  );
}
