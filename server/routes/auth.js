const express = require("express");
const router = express.Router();
const multer = require("multer");
const { signup, login, uploadProfileImage, getUserById } = require("../controllers/authController");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post("/signup", signup);
router.post("/login", login);

router.post("/upload/:userId", upload.single("profileImage"), uploadProfileImage);

router.get("/user/:userId", getUserById);

module.exports = router;
