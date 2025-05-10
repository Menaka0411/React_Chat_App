const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: String,
    phone: String,
    email: String,
    userProfile: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
