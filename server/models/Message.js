const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isBlocked: { 
      type: Boolean, 
      default: false 
    },
    safeMode: {
      type: Boolean,
      default: false
    },
    blockedForReceiver: { 
      type: Boolean, 
      default: false 
    },
    isOffensive: { 
      type: Boolean, 
      default: false 
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

module.exports = Message;
