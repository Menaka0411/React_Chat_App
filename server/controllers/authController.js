const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const { fullname, username, email, phnum, password } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({ fullname, username, email, phnum, password: hashed });

    res.status(201).json({ msg: "User created", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const imagePath = path.join("uploads", req.file.filename);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    );
    res.json({ msg: "Image uploaded", profileImage: imagePath, user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: "Image upload failed", error: err.message });
  }
}; 

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Fetching user failed", error: err.message });
  }
};