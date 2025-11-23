document.addEventListener('DOMContentLoaded', () => {

    const navMenuButton = document.getElementById('navMenuButton');
    const navDropdown = document.getElementById('navDropdown');
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifList = document.getElementById('notifList');
    const clearAllBtn = document.getElementById('clearAllNotif');

    let unreadCount = 0;

    // ===============================
    // NAV MENU DROPDOWN
    // ===============================
    if (navMenuButton && navDropdown) {
        navMenuButton.addEventListener('click', e => {
            e.stopPropagation();
            const isHidden = navDropdown.hasAttribute('hidden');
            navDropdown.toggleAttribute('hidden', !isHidden);
            navMenuButton.setAttribute('aria-expanded', String(!isHidden));

            // Close notifications if menu opened
            if (!isHidden && notifDropdown) notifDropdown.setAttribute('hidden', '');
        });

        navDropdown.addEventListener('click', async (e) => {
            e.stopPropagation();
            const item = e.target.closest('.app-nav__dropdown-item');
            if (!item) return;

            const action = item.getAttribute('data-action');
            if (action === 'settings') {
                window.location.href = '/settings';
            }
            else if (action === 'signout') {
                const confirmed = await Modal.confirm('Are you sure you want to sign out?', 'Sign Out', 'Cancel');
                if (!confirmed) return;
                
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                if (typeof Utils !== 'undefined') {
                    Utils.removeLocalStorage('user');
                    Utils.removeLocalStorage('isAuthenticated');
                }
                window.location.href = '/signin';
            }

            if (action !== 'mode') {
                navDropdown.setAttribute('hidden', '');
                navMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ===============================
    // NOTIFICATIONS DROPDOWN
    // ===============================
    if (notifBtn && notifDropdown) {
        // Load initial unread count
        loadUnreadCount();

        notifBtn.addEventListener('click', async e => {
            e.stopPropagation();
            notifDropdown.hidden = !notifDropdown.hidden;

            if (!notifDropdown.hidden && navDropdown) {
                navDropdown.setAttribute('hidden', '');
                navMenuButton.setAttribute('aria-expanded', 'false');
            }

            if (!notifDropdown.hidden) {
                notifBtn.disabled = true;
                try {
                    const res = await fetch('/notifications');
                    if (!res.ok) throw new Error('Failed to fetch notifications');
                    const data = await res.json();

                    notifList.innerHTML = '';
                    if (!data.notifications || data.notifications.length === 0) {
                        notifList.innerHTML = '<p class="no-notifications">No notifications</p>';
                    } else {
                        data.notifications.forEach(n => addNotificationToDropdown(n, false));
                    }

                    // Mark all as read when opened
                    await markAllAsRead();
                } catch (error) {
                    console.error("Error loading notifications:", error);
                    notifList.innerHTML = '<p class="error-message">Error loading notifications.</p>';
                } finally {
                    notifBtn.disabled = false;
                }
            }
        });

        notifDropdown.addEventListener('click', e => e.stopPropagation());

        clearAllBtn.addEventListener('click', async () => {
            const confirmed = await Modal.confirm('Clear all notifications?', 'Clear All', 'Cancel');
            if (!confirmed) return;
            
            try {
                await fetch('/notifications/clear', { method: 'POST' });
                notifList.innerHTML = '<p class="no-notifications">No notifications</p>';
                updateBadge(0);
            } catch (error) {
                console.error('Error clearing notifications:', error);
            }
        });
    }

    // ===============================
    // CLICK OUTSIDE HANDLER
    // ===============================
    document.addEventListener('click', e => {
        if (navDropdown && !navDropdown.contains(e.target) && e.target !== navMenuButton) {
            navDropdown.setAttribute('hidden', '');
            navMenuButton.setAttribute('aria-expanded', 'false');
        }
        if (notifDropdown && !notifDropdown.contains(e.target) && e.target !== notifBtn) {
            notifDropdown.setAttribute('hidden', '');
        }
    });

    // ===============================
    // SOCKET.IO REAL-TIME
    // ===============================
    if (typeof io !== 'undefined' && typeof USER_ID !== 'undefined') {
        const socket = io();
        
        // Join user's private room
        socket.emit('joinRoom', USER_ID);

        // Listen for new notifications
        socket.on('notification', data => {
            console.log('New notification received:', data);
            
            // Add to dropdown if open
            if (notifList && !notifDropdown.hidden) {
                addNotificationToDropdown(data, true);
            }
            
            // Update badge
            unreadCount++;
            updateBadge(unreadCount);
            
            // Show toast notification
            showToast(data);
        });

        console.log('Socket.IO connected for user:', USER_ID);
    }

    // ===============================
    // HELPER FUNCTIONS
    // ===============================
    
    async function loadUnreadCount() {
        try {
            const res = await fetch('/notifications/unread-count');
            const data = await res.json();
            unreadCount = data.unreadCount || 0;
            updateBadge(unreadCount);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }

    async function markAllAsRead() {
        try {
            const res = await fetch('/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            unreadCount = data.unreadCount || 0;
            updateBadge(unreadCount);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    function updateBadge(count) {
        if (!notifBtn) return;
        
        // Remove existing badge
        const existingBadge = notifBtn.querySelector('.notif-badge');
        if (existingBadge) existingBadge.remove();
        
        if (count > 0) {
            // Add badge
            const badge = document.createElement('span');
            badge.className = 'notif-badge';
            badge.textContent = count > 99 ? '99+' : count;
            notifBtn.appendChild(badge);
            notifBtn.style.color = 'var(--accent)';
        } else {
            notifBtn.style.color = '';
        }
    }

    function timeAgo(timestamp) {
        const diff = (new Date() - new Date(timestamp)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hrs ago';
        if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
        return new Date(timestamp).toLocaleDateString();
    }

    function addNotificationToDropdown(data, isNew = false) {
        if (!notifList) return;
        
        // Remove "no notifications" message if exists
        const noNotifMsg = notifList.querySelector('.no-notifications');
        if (noNotifMsg) noNotifMsg.remove();

        const div = document.createElement('div');
        div.classList.add('notification-item');
        if (!data.isRead) div.classList.add('unread');

        const projectLink = `/project/${data.projectId}`;
        
        // Icon based on type
        let icon = '🔔';
        if (data.type === 'like') icon = '❤️';
        else if (data.type === 'comment') icon = '💬';
        else if (data.type === 'view') icon = '👁️';

        div.innerHTML = `
            <div class="notif-icon">${icon}</div>
            <div class="notif-content">
                <p class="notif-message">
                    <strong>${data.senderName}</strong> ${getActionText(data.type)} 
                    <a href="${projectLink}" class="notif-project-link">"${data.projectName}"</a>
                </p>
                <small class="notif-time">${timeAgo(data.createdAt)}</small>
            </div>
        `;

        // Add click handler to mark as read and navigate
        div.addEventListener('click', () => {
            window.location.href = projectLink;
        });

        if (isNew) {
            notifList.prepend(div);
            div.style.animation = 'slideIn 0.3s ease';
        } else {
            notifList.appendChild(div);
        }
    }

    function getActionText(type) {
        switch(type) {
            case 'like': return 'liked';
            case 'comment': return 'commented on';
            case 'view': return 'viewed';
            default: return 'interacted with';
        }
    }

    function showToast(data) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        
        let icon = '🔔';
        if (data.type === 'like') icon = '❤️';
        else if (data.type === 'comment') icon = '💬';
        else if (data.type === 'view') icon = '👁️';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <strong>${data.senderName}</strong> ${getActionText(data.type)} your project
                <div class="toast-project">"${data.projectName}"</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Click to navigate
        toast.addEventListener('click', () => {
            window.location.href = `/project/${data.projectId}`;
        });
    }

});
