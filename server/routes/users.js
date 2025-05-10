const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
