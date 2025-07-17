import Draft from '../models/Draft.js';
import Letter from '../models/Letter.js';
import User from '../models/User.js';

// Get user's drafts
export const getDrafts = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const drafts = await Draft.getActiveDrafts(userId);
    
    // Transform drafts to include preview and additional info
    const transformedDrafts = drafts.map(draft => ({
      _id: draft._id,
      recipient: draft.recipient,
      subject: draft.subject,
      preview: draft.getPreview(),
      type: draft.type,
      replyTo: draft.replyTo,
      originalLetter: draft.originalLetter,
      lastSaved: draft.lastSaved,
      createdAt: draft.createdAt,
      deliveryDelay: draft.deliveryDelay
    }));

    res.json(transformedDrafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Error fetching drafts' });
  }
};

// Get draft by ID
export const getDraftById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const draft = await Draft.findById(id)
      .populate('recipient', 'username name profilePicture country timezone')
      .populate('replyTo', 'subject content createdAt sender')
      .populate('originalLetter', 'subject content createdAt sender');

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check if user owns this draft
    if (draft.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this draft' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ message: 'Error fetching draft' });
  }
};

// Create a new draft
export const createDraft = async (req, res) => {
  try {
    const { recipientId, subject, content, type = 'letter', replyTo = null, deliveryDelay = 0 } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!recipientId || !subject || !content) {
      return res.status(400).json({ message: 'Recipient, subject, and content are required' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // If this is a reply, check if original letter exists
    let originalLetter = null;
    if (type === 'reply' && replyTo) {
      originalLetter = await Letter.findById(replyTo);
      if (!originalLetter) {
        return res.status(404).json({ message: 'Original letter not found' });
      }
    }

    // Check if draft already exists for this reply
    if (type === 'reply' && replyTo) {
      const existingDraft = await Draft.findReplyDraft(userId, replyTo);
      if (existingDraft) {
        // Update existing draft
        existingDraft.subject = subject;
        existingDraft.content = content;
        existingDraft.deliveryDelay = deliveryDelay;
        await existingDraft.save();
        
        const populatedDraft = await Draft.findById(existingDraft._id)
          .populate('recipient', 'username name profilePicture')
          .populate('replyTo', 'subject createdAt')
          .populate('originalLetter', 'subject createdAt');
        
        return res.json(populatedDraft);
      }
    }

    // Create new draft
    const draft = await Draft.create({
      author: userId,
      recipient: recipientId,
      subject,
      content,
      type,
      replyTo,
      originalLetter: originalLetter ? originalLetter._id : null,
      deliveryDelay
    });

    const populatedDraft = await Draft.findById(draft._id)
      .populate('recipient', 'username name profilePicture')
      .populate('replyTo', 'subject createdAt')
      .populate('originalLetter', 'subject createdAt');

    res.status(201).json(populatedDraft);
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ message: 'Error creating draft' });
  }
};

// Update a draft
export const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, deliveryDelay } = req.body;
    const userId = req.user.userId;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check if user owns this draft
    if (draft.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this draft' });
    }

    // Check if draft is already completed
    if (draft.isCompleted) {
      return res.status(400).json({ message: 'Cannot update completed draft' });
    }

    // Update draft
    if (subject !== undefined) draft.subject = subject;
    if (content !== undefined) draft.content = content;
    if (deliveryDelay !== undefined) draft.deliveryDelay = deliveryDelay;

    await draft.save();

    const populatedDraft = await Draft.findById(draft._id)
      .populate('recipient', 'username name profilePicture')
      .populate('replyTo', 'subject createdAt')
      .populate('originalLetter', 'subject createdAt');

    res.json(populatedDraft);
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ message: 'Error updating draft' });
  }
};

// Delete a draft
export const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check if user owns this draft
    if (draft.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this draft' });
    }

    await Draft.findByIdAndDelete(id);

    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ message: 'Error deleting draft' });
  }
};

// Complete a draft (mark as completed)
export const completeDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const draft = await Draft.findById(id);
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Check if user owns this draft
    if (draft.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to complete this draft' });
    }

    await draft.markCompleted();

    res.json({ message: 'Draft marked as completed' });
  } catch (error) {
    console.error('Error completing draft:', error);
    res.status(500).json({ message: 'Error completing draft' });
  }
};

// Get draft statistics
export const getDraftStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Draft.aggregate([
      { $match: { author: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isCompleted', false] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
          letters: { $sum: { $cond: [{ $eq: ['$type', 'letter'] }, 1, 0] } },
          replies: { $sum: { $cond: [{ $eq: ['$type', 'reply'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      active: 0,
      completed: 0,
      letters: 0,
      replies: 0
    };

    delete result._id;
    res.json(result);
  } catch (error) {
    console.error('Error fetching draft stats:', error);
    res.status(500).json({ message: 'Error fetching draft statistics' });
  }
};

// Get draft for a specific reply
export const getReplyDraft = async (req, res) => {
  try {
    const { replyToId } = req.params;
    const userId = req.user.userId;

    const draft = await Draft.findReplyDraft(userId, replyToId)
      .populate('recipient', 'username name profilePicture')
      .populate('replyTo', 'subject content createdAt sender')
      .populate('originalLetter', 'subject content createdAt sender');

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Error fetching reply draft:', error);
    res.status(500).json({ message: 'Error fetching reply draft' });
  }
};
