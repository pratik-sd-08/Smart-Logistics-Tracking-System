import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    customerName: {
      type: String,
      required: true
    },

    senderName: {
      type: String,
      required: true,
      trim: true
    },

    senderContact: {
      type: String,
      required: true
    },

    pickupAddress: {
      type: String,
      required: true
    },

    receiverName: {
      type: String,
      required: true,
      trim: true
    },

    receiverContact: {
      type: String,
      required: true
    },

    dropAddress: {
      type: String,
      required: true
    },

    pickupLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },

    deliveryLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },

    status: {
      type: String,
      enum: [
        "created",
        "assigned",
        "picked",
        "in_transit",
        "delivered",
        "cancelled"
      ],
      default: "created"
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    deliveryOTP: {
      type: String
    },

    otpVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

orderSchema.index({ status: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ assignedDriver: 1 });

export default mongoose.model("Order", orderSchema);
