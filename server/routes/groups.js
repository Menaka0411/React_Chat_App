const express = require("express");
const multer = require("multer");
const path = require("path");
const Group = require("../models/Group");
const User = require("./users")

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/groups"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });


router.post("/", upload.single("profileImage"), async (req, res) => {
  const { groupName, groupBio, members, createdBy } = req.body;
  const profileImage = req.file ? req.file.path : "";

  try {
    const newGroup = new Group({
      groupName,
      groupBio,
      members: JSON.parse(members),
      createdBy,
      profileImage,
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
});

router.get("/", async (req, res) => {
    try {
      const groups = await Group.find();
      res.status(200).json(groups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  router.post("/get-multiple", async (req, res) => {
    const { ids } = req.body;
    try {
      const users = await User.find({ _id: { $in: ids } });
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching multiple users" });
    }
  });
  

module.exports = router;
