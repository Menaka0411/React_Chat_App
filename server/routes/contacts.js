const express = require("express");
const router = express.Router();
const multer = require("multer");
const Contact = require("../models/Contact");

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// GET contacts by userId
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
