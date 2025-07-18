import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'received', 'read', 'archived', 'pending_response', 'accepted', 'rejected'],
    default: 'sent'
  },
  type: {
    type: String,
    enum: ['letter', 'reply', 'delivery', 'friend_letter'],
    default: 'letter'
  },
  // For friend letters - track if this is the first letter between users
  isFirstLetter: {
    type: Boolean,
    default: false
  },
  // Response to friend letter
  friendRequestResponse: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: undefined,
    required: false
  },
  respondedAt: {
    type: Date,
    default: null
  },
  originalLetter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    default: null
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  archivedAt: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  deliveryDelay: {
    type: Number, // in hours
    default: 0
  },
  scheduledDelivery: {
    type: Date,
    default: null
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
letterSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
letterSchema.index({ recipient: 1, status: 1, createdAt: -1 });
letterSchema.index({ scheduledDelivery: 1, status: 1 });

// Virtual for conversation grouping
letterSchema.virtual('conversationId').get(function() {
  const ids = [this.sender.toString(), this.recipient.toString()].sort();
  return ids.join('-');
});

// Pre-save middleware to set delivery schedule
letterSchema.pre('save', function(next) {
  if (this.isNew && this.deliveryDelay > 0) {
    this.scheduledDelivery = new Date(Date.now() + this.deliveryDelay * 60 * 60 * 1000);
  }
  next();
});

// Method to check if letter can be replied to
letterSchema.methods.canReply = function(userId) {
  // Handle both populated objects and ObjectIds
  const recipientId = this.recipient._id ? this.recipient._id.toString() : this.recipient.toString();
  return recipientId === userId.toString() && 
         this.status === 'read' && 
         !this.isArchived;
};

// Method to check if letter is available to read (timer expired)
letterSchema.methods.canRead = function() {
  if (this.status === 'sent') return false;
  if (this.scheduledDelivery && new Date() < this.scheduledDelivery) {
    return false; // Still in transit
  }
  return this.status === 'delivered' || this.status === 'received';
};

// Method to check if letter is in transit
letterSchema.methods.isInTransit = function() {
  return this.status === 'delivered' && 
         this.scheduledDelivery && 
         new Date() < this.scheduledDelivery;
};

// Method to get remaining delivery time in milliseconds
letterSchema.methods.getRemainingDeliveryTime = function() {
  if (!this.scheduledDelivery) return 0;
  const remaining = this.scheduledDelivery.getTime() - Date.now();
  return Math.max(0, remaining);
};

// Method to mark as read
letterSchema.methods.markAsRead = function() {
  if (this.canRead()) {
    this.status = 'read';
    this.readAt = new Date();
  }
};

export default mongoose.model('Letter', letterSchema);
