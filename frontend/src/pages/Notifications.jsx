import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { FaCheck, FaTrash, FaComment, FaAt, FaReply, FaTimes } from 'react-icons/fa';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'answer':
      return <FaReply className="notification-type-icon answer" />;
    case 'comment':
      return <FaComment className="notification-type-icon comment" />;
    case 'mention':
      return <FaAt className="notification-type-icon mention" />;
    default:
      return <FaComment className="notification-type-icon" />;
  }
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const NotificationsPage = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useContext(NotificationContext);

  return (
    <div className="main-content">
      <div className="card" style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem' }}>
        <div className="section-title" style={{ marginBottom: 24 }}>
          <h2>All Notifications</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {notifications.some(n => !n.read) && (
              <button className="btn btn-outline btn-sm" onClick={markAllAsRead} title="Mark all as read">
                <FaCheck /> Mark all as read
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={clearAllNotifications} title="Clear all">
              <FaTrash /> Clear all
            </button>
          </div>
        </div>
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <div className="empty-icon">🔔</div>
            <p>No notifications yet</p>
            <span>We'll notify you when something happens</span>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTimeAgo(notification.createdAt)}</div>
                </div>
                <div className="notification-actions-item">
                  <button
                    className="action-btn-small"
                    onClick={e => { e.stopPropagation(); removeNotification(notification.id); }}
                    title="Remove"
                  >
                    <FaTimes />
                  </button>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 