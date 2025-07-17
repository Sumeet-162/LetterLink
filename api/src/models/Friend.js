import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'accepted' // For now, auto-accept all friendships
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastActivityType: {
    type: String,
    enum: ['sent', 'delivered', 'received', 'replied'],
    default: 'sent'
  },
  lastLetter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    default: null
  },
  letterCount: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique friendships
friendSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Index for efficient queries
friendSchema.index({ user1: 1, status: 1, lastActivity: -1 });
friendSchema.index({ user2: 1, status: 1, lastActivity: -1 });

// Pre-save middleware to ensure user1 < user2 for consistent ordering
friendSchema.pre('save', function(next) {
  if (this.user1.toString() > this.user2.toString()) {
    [this.user1, this.user2] = [this.user2, this.user1];
  }
  next();
});

// Static method to find friendship between two users
friendSchema.statics.findFriendship = function(userId1, userId2) {
  const [user1, user2] = [userId1, userId2].sort();
  return this.findOne({ user1, user2, status: 'accepted' });
};

// Static method to get all friends of a user
friendSchema.statics.getFriends = function(userId) {
  return this.find({
    $or: [
      { user1: userId },
      { user2: userId }
    ],
    status: 'accepted',
    isArchived: false
  })
  .populate('user1', 'username name profilePicture country timezone lastSeen')
  .populate('user2', 'username name profilePicture country timezone lastSeen')
  .populate('lastLetter', 'subject createdAt status type')
  .sort({ lastActivity: -1 });
};

// Method to get the other user in the friendship
friendSchema.methods.getOtherUser = function(currentUserId) {
  return this.user1._id.toString() === currentUserId.toString() ? this.user2 : this.user1;
};

// Method to update last activity
friendSchema.methods.updateActivity = function(activityType, letterId = null) {
  this.lastActivity = new Date();
  this.lastActivityType = activityType;
  if (letterId) {
    this.lastLetter = letterId;
  }
  return this.save();
};

export default mongoose.model('Friend', friendSchema);
