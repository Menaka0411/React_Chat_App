const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  groupBio: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  profileImage: {
    type: String,  
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);
