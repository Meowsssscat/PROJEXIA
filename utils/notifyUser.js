const Notification = require('../models/Notification');

/**
 * Send real-time notification via Socket.IO and save to database
 * @param {String} recipientId - User ID who will receive the notification
 * @param {String} senderId - User ID who triggered the notification
 * @param {String} projectId - Project ID related to the notification
 * @param {String} type - Type of notification: 'like', 'comment', or 'view'
 * @param {String} message - Notification message
 */
async function notifyUser(recipientId, senderId, projectId, type, message) {
  try {
    console.log('=== NOTIFY USER CALLED ===');
    console.log('Recipient ID:', recipientId);
    console.log('Sender ID:', senderId);
    console.log('Project ID:', projectId);
    console.log('Type:', type);
    console.log('Message:', message);
    
    // Don't notify if user is notifying themselves
    if (recipientId.toString() === senderId.toString()) {
      console.log('Skipping notification: user is notifying themselves');
      return;
    }

    // Save notification to database
    console.log('Creating notification in database...');
    const notification = await Notification.create({
      recipientId,
      senderId,
      projectId,
      type,
      message,
      isRead: false
    });
    console.log('Notification created:', notification._id);

    // Populate sender info for real-time display
    await notification.populate('senderId', 'fullName');
    await notification.populate('projectId', 'name');
    console.log('Notification populated');

    // Send real-time notification via Socket.IO
    if (global._io) {
      console.log('Sending real-time notification via Socket.IO');
      global._io.to(recipientId.toString()).emit('notification', {
        _id: notification._id,
        senderName: notification.senderId.fullName,
        projectName: notification.projectId.name,
        projectId: notification.projectId._id,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
      console.log('Real-time notification sent');
    } else {
      console.log('Socket.IO not available, notification saved to database only');
    }

    return notification;
  } catch (error) {
    console.error('=== ERROR SENDING NOTIFICATION ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
  }
}

module.exports = notifyUser;
