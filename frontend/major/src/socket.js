import { io } from "socket.io-client";
const SOCKET_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://smart-logistics-tracking-system.onrender.com";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"]
});

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

export default socket;
