import eventBus from "../events/eventBus.js";

export const initSocket = (io) => {

  eventBus.on("orderCreated", (order) => {
    io.emit("orderCreated", order);
  });

  eventBus.on("statusUpdated", (order) => {
    io.emit("statusUpdated", order);
  });

  io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    socket.on("driverLocation", (data) => {
      io.emit("locationUpdate", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

  });
};
