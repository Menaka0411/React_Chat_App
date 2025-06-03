const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Checks if sender and receiver are mutual friends
 * by verifying both have each other marked as friend in Contacts.
 * Also checks if they have at least minMessages of friendly messages.
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {number} minMessages 
 * @returns {Promise<boolean>}
 */
async function hasFriendlyHistory(senderId, receiverId, minMessages = 5) {
 const senderObjectId = new mongoose.Types.ObjectId(senderId);
 const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

  const [senderUser, receiverUser] = await Promise.all([
    User.findById(senderObjectId).select('phone email'),
    User.findById(receiverObjectId).select('phone email'),
  ]);

  if (!senderUser || !receiverUser) {
    return false;
  }

  const senderContacts = await Contact.find({ userId: senderObjectId, isFriend: true });
  const senderHasReceiver = senderContacts.some(contact =>
    (receiverUser.phone && contact.phone === receiverUser.phone) ||
    (receiverUser.email && contact.email === receiverUser.email)
  );

  const receiverContacts = await Contact.find({ userId: receiverObjectId, isFriend: true });
  const receiverHasSender = receiverContacts.some(contact =>
    (senderUser.phone && contact.phone === senderUser.phone) ||
    (senderUser.email && contact.email === senderUser.email)
  );

  if (!(senderHasReceiver && receiverHasSender)) {
    const count = await Message.countDocuments({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      text: { $not: { $regex: /This message has offensive content|sensitive content/i } },
    });

    return count >= minMessages;
  }

  return true;
}

module.exports = { hasFriendlyHistory };
