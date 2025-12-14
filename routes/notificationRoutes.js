const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationController');
const checkUser = require('../middleware/checkUser');

// Get all notifications
router.get('/', checkUser, notificationsController.getNotifications);

// Get unread count
router.get('/unread-count', checkUser, notificationsController.getUnreadCount);

// Mark notification(s) as read
router.post('/mark-read', checkUser, notificationsController.markAsRead);

// Clear all notifications
router.post('/clear', checkUser, notificationsController.clearNotifications);

// Delete single notification
router.delete('/:notificationId', checkUser, notificationsController.deleteNotification);

// Handle notification click and navigate to relevant page
router.post('/:notificationId/click', checkUser, notificationsController.handleNotificationClick);

module.exports = router;
