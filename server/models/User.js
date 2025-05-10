const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  phnum: String,
  password: String,
  profileImage: String,
});

module.exports = mongoose.model("User", UserSchema);
