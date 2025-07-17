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
    enum: ['sent', 'delivered', 'received', 'read', 'archived'],
    default: 'sent'
  },
  type: {
    type: String,
    enum: ['letter', 'reply', 'delivery'],
    default: 'letter'
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
  return this.recipient.toString() === userId.toString() && 
         this.status === 'read' && 
         !this.isArchived;
};

// Method to mark as read
letterSchema.methods.markAsRead = function() {
  if (this.status === 'delivered' || this.status === 'received') {
    this.status = 'read';
    this.readAt = new Date();
  }
};

export default mongoose.model('Letter', letterSchema);
