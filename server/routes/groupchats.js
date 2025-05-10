// routes/groupMessages.js
const express = require('express');
const router = express.Router();
const GroupChat = require('../models/GroupChat');

// Fetch group messages
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await GroupChat.find({ groupId })
      .sort({ timestamp: 1 })
      .populate('senderId', 'username profileImage'); // populate sender data
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Post new group message
router.post('/', async (req, res) => {
  try {
    const { groupId, senderId, text, timestamp } = req.body;
    const newMessage = new GroupChat({
        groupId,
        senderId,
        text,
        timestamp,
      });
      
      newMessage.save()
        .then((message) => {
          console.log("Message saved:", message);
          res.json(message);
        })
        .catch((err) => {
          console.error("Error saving message:", err);
          res.status(500).send("Server Error");
        });
      
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
