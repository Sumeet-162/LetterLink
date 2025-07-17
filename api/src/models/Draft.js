import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  author: {
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
  type: {
    type: String,
    enum: ['letter', 'reply'],
    default: 'letter'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    default: null
  },
  originalLetter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter',
    default: null
  },
  lastSaved: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  deliveryDelay: {
    type: Number, // in hours
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
draftSchema.index({ author: 1, isCompleted: 1, lastSaved: -1 });
draftSchema.index({ author: 1, recipient: 1, replyTo: 1 });

// Pre-save middleware to update lastSaved
draftSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('subject')) {
    this.lastSaved = new Date();
  }
  next();
});

// Method to mark draft as completed
draftSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to get draft preview
draftSchema.methods.getPreview = function(length = 150) {
  const preview = this.content.replace(/\n/g, ' ').substring(0, length);
  return preview.length < this.content.length ? preview + '...' : preview;
};

// Static method to get user's active drafts
draftSchema.statics.getActiveDrafts = function(userId) {
  return this.find({
    author: userId,
    isCompleted: false
  })
  .populate('recipient', 'username name profilePicture')
  .populate('replyTo', 'subject createdAt')
  .populate('originalLetter', 'subject createdAt')
  .sort({ lastSaved: -1 });
};

// Static method to find draft for reply
draftSchema.statics.findReplyDraft = function(userId, replyToId) {
  return this.findOne({
    author: userId,
    replyTo: replyToId,
    isCompleted: false
  });
};

export default mongoose.model('Draft', draftSchema);
