import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  },
  // When accepted, this becomes the initial letter in their friendship
  letterCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Letter'
  }
}, {
  timestamps: true
});

// Index for efficient queries
friendRequestSchema.index({ recipient: 1, status: 1 });
friendRequestSchema.index({ sender: 1, status: 1 });
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true }); // Prevent duplicate requests

export default mongoose.model('FriendRequest', friendRequestSchema);
