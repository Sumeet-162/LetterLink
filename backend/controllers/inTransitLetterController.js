const InTransitLetter = require('../models/InTransitLetter');
const FriendRequest = require('../models/FriendRequest');
const Letter = require('../models/Letter');
const User = require('../models/User');

const inTransitLetterController = {
  // Get all in-transit letters for a user (letters coming to them)
  getInTransitLetters: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const inTransitLetters = await InTransitLetter.getInTransitForUser(userId);
      
      // Format the response with remaining time calculations
      const formattedLetters = inTransitLetters.map(letter => {
        const now = new Date();
        const remaining = letter.deliveryDate.getTime() - now.getTime();
        
        let remainingTime = '';
        if (remaining > 0) {
          const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
          const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            remainingTime = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            remainingTime = `${hours}h ${minutes}m`;
          } else {
            remainingTime = `${minutes}m`;
          }
        } else {
          remainingTime = 'Ready for delivery';
        }
        
        return {
          _id: letter._id,
          sender: letter.sender,
          letter: {
            _id: letter.letter._id,
            subject: letter.letter.subject,
            content: letter.letter.content.substring(0, 150) + '...' // Preview only
          },
          letterType: letter.letterType,
          senderCountry: letter.senderCountry,
          recipientCountry: letter.recipientCountry,
          deliveryTimeDays: letter.deliveryTimeDays,
          estimatedDeliveryText: letter.estimatedDeliveryText,
          deliveryDate: letter.deliveryDate,
          sentAt: letter.sentAt,
          remainingTime,
          isReadyForDelivery: remaining <= 0,
          friendRequest: letter.friendRequest
        };
      });
      
      res.json({
        success: true,
        inTransitLetters: formattedLetters,
        count: formattedLetters.length
      });
    } catch (error) {
      console.error('Error fetching in-transit letters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch in-transit letters',
        error: error.message
      });
    }
  },

  // Process letters that are ready for delivery
  processReadyLetters: async (req, res) => {
    try {
      const readyLetters = await InTransitLetter.findReadyForDelivery();
      
      let processedCount = 0;
      const results = [];
      
      for (const inTransitLetter of readyLetters) {
        try {
          if (inTransitLetter.letterType === 'friend_request' && inTransitLetter.friendRequest) {
            // For friend request letters, update the friend request status to make it visible
            await FriendRequest.findByIdAndUpdate(
              inTransitLetter.friendRequest._id,
              { 
                isDelivered: true,
                deliveredAt: new Date()
              }
            );
          }
          
          // Mark the in-transit letter as delivered
          await inTransitLetter.markAsDelivered();
          
          processedCount++;
          results.push({
            letterId: inTransitLetter._id,
            type: inTransitLetter.letterType,
            sender: inTransitLetter.sender.username,
            recipient: inTransitLetter.recipient.username,
            deliveredAt: new Date()
          });
          
        } catch (error) {
          console.error(`Error processing letter ${inTransitLetter._id}:`, error);
          results.push({
            letterId: inTransitLetter._id,
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${processedCount} letters`,
        processedCount,
        results
      });
    } catch (error) {
      console.error('Error processing ready letters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process ready letters',
        error: error.message
      });
    }
  },

  // Manual delivery of a specific letter (for testing or admin purposes)
  deliverLetter: async (req, res) => {
    try {
      const { letterId } = req.params;
      const userId = req.user.id;
      
      const inTransitLetter = await InTransitLetter.findOne({
        _id: letterId,
        recipient: userId,
        isDelivered: false
      }).populate('sender recipient letter friendRequest');
      
      if (!inTransitLetter) {
        return res.status(404).json({
          success: false,
          message: 'In-transit letter not found or already delivered'
        });
      }
      
      // Check if delivery time has passed
      if (new Date() < inTransitLetter.deliveryDate) {
        return res.status(400).json({
          success: false,
          message: 'Letter is not ready for delivery yet'
        });
      }
      
      // Process the delivery
      if (inTransitLetter.letterType === 'friend_request' && inTransitLetter.friendRequest) {
        await FriendRequest.findByIdAndUpdate(
          inTransitLetter.friendRequest._id,
          { 
            isDelivered: true,
            deliveredAt: new Date()
          }
        );
      }
      
      await inTransitLetter.markAsDelivered();
      
      res.json({
        success: true,
        message: 'Letter delivered successfully',
        letter: {
          _id: inTransitLetter._id,
          sender: inTransitLetter.sender,
          letter: inTransitLetter.letter,
          letterType: inTransitLetter.letterType,
          deliveredAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error delivering letter:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deliver letter',
        error: error.message
      });
    }
  },

  // Get delivery statistics for a user
  getDeliveryStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const [inTransitCount, totalSent, totalReceived] = await Promise.all([
        InTransitLetter.countDocuments({ recipient: userId, isDelivered: false }),
        InTransitLetter.countDocuments({ sender: userId }),
        InTransitLetter.countDocuments({ recipient: userId, isDelivered: true })
      ]);
      
      res.json({
        success: true,
        stats: {
          inTransitCount,
          totalSent,
          totalReceived,
          totalDelivered: totalReceived
        }
      });
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery statistics',
        error: error.message
      });
    }
  }
};

module.exports = inTransitLetterController;
