const Notification = require('../models/Notification');
const User = require('../models/User');
const Project = require('../models/uploadProject');

// ===============================
// GET NOTIFICATIONS
// ===============================
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Fetch notifications for this user, sorted by newest first
    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'fullName')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 notifications
      .lean();

    // Format notifications for frontend
    const formattedNotifications = notifications.map(n => ({
      _id: n._id,
      senderId: n.senderId?._id,
      senderName: n.senderId?.fullName || 'Unknown User',
      projectName: n.projectId?.name || 'Unknown Project',
      projectId: n.projectId?._id,
      type: n.type,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt
    }));

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({ 
      notifications: formattedNotifications,
      unreadCount 
    });

  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Error loading notifications' });
  }
};

// ===============================
// GET UNREAD COUNT
// ===============================
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({ unreadCount });

  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Error loading unread count' });
  }
};

// ===============================
// MARK AS READ
// ===============================
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { notificationId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    if (notificationId) {
      // Mark single notification as read
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true }
      );
    } else {
      // Mark all notifications as read
      await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
      );
    }

    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({ success: true, unreadCount });

  } catch (err) {
    console.error('Error marking as read:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ===============================
// CLEAR NOTIFICATIONS
// ===============================
exports.clearNotifications = async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Delete all notifications for this user
    await Notification.deleteMany({ recipientId: userId });

    res.json({ success: true });

  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

// ===============================
// DELETE SINGLE NOTIFICATION
// ===============================
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.json({ success: true, unreadCount });

  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// ===============================
// HANDLE NOTIFICATION CLICK
// ===============================
exports.handleNotificationClick = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    // Find and mark notification as read
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    ).populate('projectId', '_id');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Determine redirect route based on notification type
    let redirectUrl = '/';
    
    if (notification.type === 'like' || notification.type === 'comment') {
      if (notification.projectId?._id) {
        redirectUrl = `/project/${notification.projectId._id}`;
      }
    } else if (notification.type === 'follow') {
      if (notification.senderId) {
        redirectUrl = `/profile/${notification.senderId}`;
      }
    }

    res.json({ success: true, redirectUrl });

  } catch (err) {
    console.error('Error handling notification click:', err);
    res.status(500).json({ error: 'Failed to handle notification click' });
  }
};
