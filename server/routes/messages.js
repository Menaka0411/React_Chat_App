const express = require('express');
const router = express.Router();
const Message = require('../models/message'); 
const mongoose = require('mongoose');
const User = require('./users');

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
    })));
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, text, timestamp } = req.body;
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

    // Group messages by other user
    const chatMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.senderId.toString() === userId ? msg.receiverId : msg.senderId;
      if (!chatMap.has(otherUserId)) {
        chatMap.set(otherUserId, msg);
      }
    }

    // Fetch basic user info (phone, name, etc.)
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


module.exports = router;
