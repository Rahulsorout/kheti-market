import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinContract", (contractId) => {
    socket.join(contractId);
    console.log(
      `Socket ${socket.id} joined contract ${contractId}`
    );
  });

  socket.on("joinOrder", (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(
      `Socket ${socket.id} joined order ${orderId}`
    );
  });

  socket.on("joinFarmer", (farmerId) => {
    socket.join(`farmer:${farmerId}`);
    console.log(
      `Socket ${socket.id} joined farmer ${farmerId}`
    );
  });
socket.on("joinBuyer", (buyerId) => {
  socket.join(`buyer:${buyerId}`);
  console.log(`Socket ${socket.id} joined buyer ${buyerId}`);
});
  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};