const { Server } = require("socket.io");

let io;
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {

    socket.on("register-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send-message", (data) => {
      const { senderId, receiverId, text, timestamp } = data;
      const receiverSocket = onlineUsers.get(receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", {
          senderId,
          receiverId,
          text,
          timestamp,
        });
      }
    });

    socket.on("disconnect", () => {
      for (const [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          break;
        }
      }
    });
  });
};

module.exports = { initSocket };
