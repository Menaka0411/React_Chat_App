const { Server } = require("socket.io");
const Message = require('./models/Message'); 
const User = require('./models/User');      
const { hasFriendlyHistory } = require('./utils/MessageUtils'); 
const axios = require("axios");

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

socket.on("send-message", async (data) => {
  const { senderId, receiverId, text, timestamp, safeMode } = data;
  const messageTime = timestamp || new Date();

  try {
    const receiverUser = await User.findById(receiverId);
    const receiverSafeModeEnabled = receiverUser?.cyberSafeMode ?? false;

    const senderUser = await User.findById(senderId);
    const senderSafeModeEnabled = senderUser?.cyberSafeMode ?? false;

    const friendly = await hasFriendlyHistory(senderId, receiverId);

    // Predict offensive
    const response = await axios.post("http://localhost:5000/predict", { message: text });
    const label = response.data.label;
    const offensive = label === "bully";

    // Block message if sender safe mode & offensive
    if (offensive && senderSafeModeEnabled) {
      socket.emit("receive-message", {
        senderId,
        receiverId,
        text: "You cannot send offensive messages in safe mode.",
        isBlocked: true,
        blockedForReceiver: false,
        safeMode,
        timestamp: messageTime,
      });
      return;
    }

    // Prepare message flags
    let isBlocked = false;
    let blockedForReceiver = false;
    let messageText = text;

    if (offensive && receiverSafeModeEnabled && !friendly) {
      isBlocked = true;
      blockedForReceiver = true;
    }

    // Save message with flags
    const newMessage = new Message({
      senderId,
      receiverId,
      text: messageText,
      timestamp: messageTime,
      isBlocked,
      blockedForReceiver,
      safeMode,
    });

    await newMessage.save();

    // Emit saved message to sender and receiver
    const messageToSend = {
      ...newMessage._doc,
      senderId: newMessage.senderId.toString(),
      receiverId: newMessage.receiverId.toString(),
    };

    // To sender
    const senderSocketId = onlineUsers.get(senderId);
    if (senderSocketId) io.to(senderSocketId).emit("receive-message", messageToSend);

    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      let receiverMessage = messageToSend;

      if (newMessage.blockedForReceiver && receiverSafeModeEnabled) {
        receiverMessage = {
          ...messageToSend,
          text: "This message seems to have some offensive content and can't be viewed due to safe mode.",
        };
      }

      io.to(receiverSocketId).emit("receive-message", receiverMessage);
    }


  } catch (err) {
    console.error("Error sending message", err);
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
