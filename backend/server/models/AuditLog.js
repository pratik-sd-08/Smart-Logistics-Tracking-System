import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  userId: String,
  action: String,
  metadata: Object
}, { timestamps: true });

export default mongoose.model("AuditLog", auditSchema);
