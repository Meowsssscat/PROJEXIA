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
    // Don't notify if user is notifying themselves
    if (recipientId.toString() === senderId.toString()) {
      return;
    }

    // Save notification to database
    const notification = await Notification.create({
      recipientId,
      senderId,
      projectId,
      type,
      message,
      isRead: false
    });

    // Populate sender info for real-time display
    await notification.populate('senderId', 'fullName');
    await notification.populate('projectId', 'name');

    // Send real-time notification via Socket.IO
    if (global._io) {
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
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

module.exports = notifyUser;
