const mongoose = require('mongoose');

const inTransitLetterSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  letter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    required: true
  },
  friendRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendRequest',
    required: false // Only for friend request letters
  },
  senderCountry: {
    type: String,
    required: true
  },
  recipientCountry: {
    type: String,
    required: true
  },
  deliveryTimeMinutes: {
    type: Number,
    required: true
  },
  deliveryTimeDays: {
    type: Number,
    required: true
  },
  estimatedDeliveryText: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  letterType: {
    type: String,
    enum: ['friend_request', 'regular_letter', 'random_match'],
    required: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
inTransitLetterSchema.index({ recipient: 1, isDelivered: 1 });
inTransitLetterSchema.index({ deliveryDate: 1, isDelivered: 1 });
inTransitLetterSchema.index({ sender: 1, recipient: 1 });

// Virtual for checking if delivery time has passed
inTransitLetterSchema.virtual('shouldBeDelivered').get(function() {
  return new Date() >= this.deliveryDate;
});

// Instance method to mark as delivered
inTransitLetterSchema.methods.markAsDelivered = async function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  await this.save();
};

// Static method to find letters ready for delivery
inTransitLetterSchema.statics.findReadyForDelivery = function() {
  return this.find({
    isDelivered: false,
    deliveryDate: { $lte: new Date() }
  }).populate('sender recipient letter friendRequest');
};

// Static method to get in-transit letters for a user
inTransitLetterSchema.statics.getInTransitForUser = function(userId) {
  return this.find({
    recipient: userId,
    isDelivered: false
  })
  .populate('sender', 'username name country profilePicture')
  .populate('letter', 'subject content')
  .sort({ deliveryDate: 1 });
};

module.exports = mongoose.model('InTransitLetter', inTransitLetterSchema);
