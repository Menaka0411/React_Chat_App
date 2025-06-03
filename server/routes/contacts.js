const express = require("express");
const router = express.Router();
const multer = require("multer");
const Contact = require("../models/Contact");
const { hasFriendlyHistory } = require("../utils/MessageUtils");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.patch("/:id/friend-toggle", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    contact.isFriend = !contact.isFriend;
    await contact.save();

    res.json(contact);
  } catch (err) {
    console.error("Error toggling friend status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/friendship-status", async (req, res) => {
  const { senderId, receiverId } = req.query;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Missing senderId or receiverId" });
  }

  try {
    const result = await hasFriendlyHistory(senderId, receiverId);
    res.json({ areFriends: result });
  } catch (error) {
    console.error("Error checking friendship:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.params.userId });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});


// POST a contact under a specific userId
router.post("/:userId", upload.single("profile"), async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const profilePath = req.file ? req.file.path : "";

    const newContact = new Contact({
      userId: req.params.userId,
      name,
      phone,
      email,
      userProfile: profilePath,
    });

    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: "Failed to create contact" });
  }
});


module.exports = router;
