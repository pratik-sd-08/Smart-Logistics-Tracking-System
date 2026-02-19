import Order from "../models/Order.js";
import AuditLog from "../models/AuditLog.js";
import { v4 as uuidv4 } from "uuid";
import eventBus from "../events/eventBus.js";

export const createOrder = async (req, res) => {
  const order = await Order.create({
    orderId: uuidv4(),
    user: req.user.id,
    ...req.body
  });

  await AuditLog.create({
    userId: req.user.id,
    action: "ORDER_CREATED",
    metadata: order
  });

  eventBus.emit("orderCreated", order);

  res.json(order);
};

export const getOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.user.role === "driver") {
    query.assignedDriver = req.user.id;
  } else if (req.user.role === "user") {
    query.user = req.user.id;
  }

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("assignedDriver")
    .populate("user", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({ orders, total });
};

export const updateStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.body.status === "in_transit") {
      order.deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
      order.otpVerified = false;
      order.status = "in_transit";

      await order.save();

      await AuditLog.create({
        userId: req.user.id,
        action: "STATUS_UPDATED",
        metadata: order
      });

      eventBus.emit("statusUpdated", order);

      return res.json(order);
    }

    if (req.body.status === "delivered") {

      if (!req.body.otp) {
        return res.status(400).json({ message: "OTP required" });
      }

      if (req.body.otp !== order.deliveryOTP) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      order.status = "delivered";
      order.otpVerified = true;

      await order.save();

      await AuditLog.create({
        userId: req.user.id,
        action: "STATUS_UPDATED",
        metadata: order
      });

      eventBus.emit("statusUpdated", order);

      return res.json(order);
    }

    order.status = req.body.status;

    await order.save();

    await AuditLog.create({
      userId: req.user.id,
      action: "STATUS_UPDATED",
      metadata: order
    });

    eventBus.emit("statusUpdated", order);

    res.json(order);

  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOrder = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await order.deleteOne();

  await AuditLog.create({
    userId: req.user.id,
    action: "ORDER_DELETED",
    metadata: order
  });

  res.json({ message: "Order deleted" });
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "admin") {
      if (req.body.assignedDriver) {
        order.assignedDriver = req.body.assignedDriver;
      }

      if (req.body.status) {
        order.status = req.body.status;
      }
    }

    if (req.user.role === "user") {
      if (order.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      order.customerName = req.body.customerName || order.customerName;
      order.senderName = req.body.senderName || order.senderName;
      order.senderContact = req.body.senderContact || order.senderContact;
      order.pickupAddress = req.body.pickupAddress || order.pickupAddress;
      order.receiverName = req.body.receiverName || order.receiverName;
      order.receiverContact = req.body.receiverContact || order.receiverContact;
      order.dropAddress = req.body.dropAddress || order.dropAddress;
      order.pickupLocation = req.body.pickupLocation || order.pickupLocation;
      order.deliveryLocation = req.body.deliveryLocation || order.deliveryLocation;
    }

    await order.save();

    await AuditLog.create({
      userId: req.user.id,
      action: "ORDER_UPDATED",
      metadata: order
    });

    eventBus.emit("statusUpdated", order);

    res.json(order);

  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  res.json(stats);
};
