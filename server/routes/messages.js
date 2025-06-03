const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); 
const mongoose = require('mongoose');
const User = require('../models/User');
const { hasFriendlyHistory } = require('../utils/MessageUtils');
const axios = require('axios');

router.get('/:senderId/:receiverId', async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId) },
        { senderId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(senderId) },
      ]
    }).sort({ timestamp: 1 });

    res.json(messages.map(msg => ({
      ...msg._doc,
      senderId: msg.senderId.toString(),
      receiverId: msg.receiverId.toString(),
      isBlocked: msg.isBlocked || false,
      blockedForReceiver: msg.blockedForReceiver || false
    })));
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/recent-chats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .sort({ timestamp: -1 });

    const chatMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.senderId.toString() === userId ? msg.receiverId : msg.senderId;
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, msg);
      }
    }

    const recentChats = await Promise.all(
      Array.from(chatMap.entries()).map(async ([otherUserId, lastMsg]) => {
        const user = await User.findById(otherUserId).select("name phone userProfile");
        return {
          userId: otherUserId,
          name: user?.name || "Unknown User",
          phone: user?.phone || "N/A",
          userProfile: user?.userProfile || null,
          lastMsg: lastMsg.text,
          timestamp: lastMsg.timestamp
        };
      })
    );

    res.json(recentChats);
  } catch (err) {
    console.error("Failed to fetch recent chats", err);
    res.status(500).json({ message: "Server Error" });
  }
});


router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text, timestamp, safeMode } = req.body;

    if (safeMode) {
      
      const receiverUser = await User.findById(receiverId);
      const receiverSafeModeEnabled = receiverUser?.cyberSafeMode ?? false;
      
      const response = await axios.post("http://localhost:5000/predict", { message: text });
      const label = response.data.label;

      const isOffensive = label === "bully"; 
      const friendly = await hasFriendlyHistory(senderId, receiverId);

      if (isOffensive && receiverSafeModeEnabled && !friendly) {
        const blockedMsg = {
          senderId,
          receiverId,
          text: "This message seems to have some offensive content and can't be viewed due to safe mode.",
          isBlocked: true,
          showOnlyToSender: true,
          blockedForReceiver: true,
          timestamp: new Date().toISOString(),
        };

        const saved = await Message.create(blockedMsg);

        return res.status(200).json({
          ...saved._doc,
          text, 
          isBlocked: true,
          blockedForReceiver: true
        });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      timestamp,
    });

    await newMessage.save();
    res.json(newMessage);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


module.exports = router;