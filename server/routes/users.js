const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/safe-mode/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const safeMode = user?.cyberSafeMode ?? false;
    res.json(safeMode);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cyber safe mode" });
  }
});

router.post("/find-by-contact", async (req, res) => {
  const { phone, email } = req.body;

  try {
    const user = await User.findOne({ $or: [{ phone }, { email }] });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error finding user by contact:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
