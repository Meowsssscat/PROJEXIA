// Notifications System
(function() {
  'use strict';

  let io = null;
  let currentUserId = null;
  let notificationSocket = null;

  // Initialize Socket.IO connection
  function initializeSocket() {
    // Try to connect to Socket.IO if available
    if (typeof window !== 'undefined' && window.location) {
      try {
        io = window.io || (window.io ? window.io : null);
        if (!io) {
          console.log('Socket.IO not available, using polling for notifications');
          return;
        }
        
        // Get current user ID from localStorage or URL
        const userMatch = window.location.pathname.match(/\/profile\/([a-zA-Z0-9]+)/);
        if (userMatch) {
          currentUserId = userMatch[1];
        }
        
        // Connect to socket and join user room
        if (window.io && typeof window.io === 'function') {
          notificationSocket = window.io();
          
          // Get user ID from server
          fetch('/api/user-id')
            .then(res => res.json())
            .then(data => {
              currentUserId = data.userId;
              if (notificationSocket && currentUserId) {
                notificationSocket.emit('joinRoom', currentUserId);
                console.log('Joined notification room:', currentUserId);
              }
            })
            .catch(err => {
              console.log('Could not get user ID:', err);
              // Use polling fallback
              pollNotifications();
            });
          
          // Listen for real-time notifications
          notificationSocket.on('notification', handleRealtimeNotification);
        }
      } catch (err) {
        console.log('Socket.IO initialization error:', err);
        pollNotifications();
      }
    }
  }

  // Handle real-time notifications from Socket.IO
  function handleRealtimeNotification(data) {
    console.log('Real-time notification received:', data);
    addNotificationToUI(data);
    updateUnreadCount();
    showNotificationToast(data);
  }

  // Fetch notifications from API
  async function loadNotifications() {
    try {
      const response = await fetch('/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      displayNotifications(data.notifications || []);
      updateUnreadCountBadge(data.unreadCount || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      showNotificationsError();
    }
  }

  // Display notifications in the panel
  function displayNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
      list.innerHTML = '<div class="navbar-notification-empty">No notifications yet</div>';
      return;
    }

    list.innerHTML = notifications.map(notif => `
      <div class="navbar-notification-item ${notif.isRead ? '' : 'unread'}" data-id="${notif._id}" onclick="window.location.href='/project/${notif.projectId}'" style="cursor: pointer;">
        <div class="navbar-notification-content">
          <div class="navbar-notification-message">
            <strong><a href="/visit/profile/${notif.senderId}" onclick="event.stopPropagation();" style="color: inherit; text-decoration: none; border-bottom: 1px solid currentColor;">${notif.senderName}</a></strong> ${getNotificationMessage(notif)}
          </div>
          <div class="navbar-notification-meta">
            <span style="color: hsl(var(--primary));">
              ${notif.projectName}
            </span>
            · ${formatTime(notif.createdAt)}
          </div>
        </div>
        <button class="navbar-notification-delete-btn" onclick="deleteNotification('${notif._id}', event)">×</button>
      </div>
    `).join('');

    // Mark notifications as read when viewed
    notifications.forEach(notif => {
      if (!notif.isRead) {
        markNotificationAsRead(notif._id);
      }
    });
  }

  // Add single notification to UI (for real-time)
  function addNotificationToUI(notif) {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    // Remove "no notifications" message if present
    const emptyMsg = list.querySelector('.navbar-notification-empty');
    if (emptyMsg) emptyMsg.remove();

    // Add notification to top of list
    const item = document.createElement('div');
    item.className = 'navbar-notification-item unread';
    item.setAttribute('data-id', notif._id);
    item.style.cursor = 'pointer';
    item.onclick = () => window.location.href = `/project/${notif.projectId}`;
    item.innerHTML = `
      <div class="navbar-notification-content">
        <div class="navbar-notification-message">
          <strong><a href="/visit/profile/${notif.senderId}" onclick="event.stopPropagation();" style="color: inherit; text-decoration: none; border-bottom: 1px solid currentColor;">${notif.senderName}</a></strong> ${getNotificationMessage(notif)}
        </div>
        <div class="navbar-notification-meta">
          <span style="color: hsl(var(--primary));">
            ${notif.projectName}
          </span>
          · just now
        </div>
      </div>
      <button class="navbar-notification-delete-btn" onclick="deleteNotification('${notif._id}', event)">×</button>
    `;

    list.insertBefore(item, list.firstChild);
    markNotificationAsRead(notif._id);
  }

  // Get notification message based on type
  function getNotificationMessage(notif) {
    const messages = {
      'like': 'liked your project',
      'comment': 'commented on your project',
      'reply': 'replied to your comment',
      'view': 'viewed your project',
      'follow': 'started following you'
    };
    return messages[notif.type] || notif.message || 'interacted with your project';
  }

  // Format time for notification
  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  // Update unread count
  async function updateUnreadCount() {
    try {
      const response = await fetch('/notifications/unread-count');
      if (response.ok) {
        const data = await response.json();
        updateUnreadCountBadge(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }

  // Update badge with unread count (both desktop and mobile)
  function updateUnreadCountBadge(count) {
    const badge = document.getElementById('notificationBadge');
    const badgeMobile = document.getElementById('notificationBadgeMobile');

    // Update desktop badge
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
    
    // Update mobile badge
    if (badgeMobile) {
      if (count > 0) {
        badgeMobile.textContent = count > 99 ? '99+' : count;
        badgeMobile.style.display = 'flex';
      } else {
        badgeMobile.style.display = 'none';
      }
    }
  }

  // Mark notification as read
  async function markNotificationAsRead(notificationId) {
    try {
      await fetch('/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  // Delete notification
  async function deleteNotification(notificationId, event) {
    event?.stopPropagation?.();
    
    try {
      const response = await fetch(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const item = document.querySelector(`[data-id="${notificationId}"]`);
        if (item) item.remove();
        updateUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }

  // Clear all notifications
  async function clearAllNotifications() {
    const confirmed = await Modal.confirm('Clear all notifications?', 'Clear Notifications', 'Clear', 'Cancel');
    if (!confirmed) return;

    try {
      await fetch('/notifications/clear', { method: 'POST' });
      loadNotifications();
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }

  // Show notification toast
  function showNotificationToast(notif) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      background: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 0.75rem;
      padding: 1rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      max-width: 350px;
      animation: slideIn 0.3s ease;
      cursor: pointer;
    `;

    toast.innerHTML = `
      <strong>${notif.senderName}</strong> ${getNotificationMessage(notif)}
      <br>
      <small style="color: hsl(var(--muted-foreground));">${notif.projectName}</small>
    `;

    // Make toast clickable
    toast.onclick = () => {
      window.location.href = `/project/${notif.projectId}`;
    };

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Show error message
  function showNotificationsError() {
    const list = document.getElementById('notificationsList');
    if (list) {
      list.innerHTML = '<div class="navbar-notification-empty">Failed to load notifications</div>';
    }
  }

  // Poll notifications (fallback if Socket.IO not available)
  function pollNotifications() {
    loadNotifications();
    setInterval(loadNotifications, 30000); // Poll every 30 seconds
  }

  // Setup notification panel toggle (both desktop and mobile)
  function setupNotificationPanel() {
    const bellBtn = document.getElementById('notificationBellBtn');
    const bellBtnMobile = document.getElementById('notificationBellBtnMobile');
    const panel = document.getElementById('notificationPanel');
    const clearBtn = document.getElementById('clearNotificationsBtn');

    // Desktop notification button
    if (bellBtn && panel) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          loadNotifications();
        }
      });

      // Close panel when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar-notifications-wrapper')) {
          panel.style.display = 'none';
        }
      });
    }
    
    // Mobile notification button
    if (bellBtnMobile && panel) {
      bellBtnMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          loadNotifications();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllNotifications);
    }
  }

  // Add CSS animation styles
  function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Make functions globally available
  window.deleteNotification = deleteNotification;
  window.clearAllNotifications = clearAllNotifications;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addAnimationStyles();
      setupNotificationPanel();
      initializeSocket();
      loadNotifications();
    });
  } else {
    addAnimationStyles();
    setupNotificationPanel();
    initializeSocket();
    loadNotifications();
  }

  // Refresh notifications periodically
  setInterval(updateUnreadCount, 60000); // Every minute
})();
