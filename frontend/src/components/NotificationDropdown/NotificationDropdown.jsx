import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTrash, FaComment, FaAt, FaReply, FaTimes } from 'react-icons/fa';
import { NotificationContext } from '../../context/NotificationContext';
// import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useContext(NotificationContext);

  const getNotificationContent = (notification) => {
    // If title and message are provided by backend, use them
    if (notification.title && notification.message) {
      return {
        title: notification.title,
        message: notification.message
      };
    }

    // Fallback content based on notification type
    switch (notification.type) {
      case 'new_answer':
        return {
          title: 'New Answer',
          message: `${notification.senderId?.username || 'Someone'} answered your question`
        };
      case 'new_comment':
        return {
          title: 'New Comment',
          message: `${notification.senderId?.username || 'Someone'} commented on your ${notification.referenceType || 'content'}`
        };
      case 'mention':
        return {
          title: 'Mention',
          message: `${notification.senderId?.username || 'Someone'} mentioned you in a ${notification.referenceType || 'post'}`
        };
      default:
        return {
          title: 'Notification',
          message: 'You have a new notification'
        };
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_answer':
        return <FaReply className="notification-type-icon answer" />;
      case 'new_comment':
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

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="notification-dropdown">
        <div className="notification-header">
          <h3>Notifications</h3>
        </div>
        <div className="notification-empty">
          <div className="empty-icon">🔔</div>
          <p>No notifications yet</p>
          <span>We'll notify you when something happens</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="notification-actions">
          {notifications.some(n => !n.read) && (
            <button
              className="action-btn"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <FaCheck />
            </button>
          )}
          <button
            className="action-btn"
            onClick={clearAllNotifications}
            title="Clear all"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.slice(0, 10).map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notification-icon">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="notification-content">
              <div className="notification-title">
                {getNotificationContent(notification).title}
              </div>
              <div className="notification-message">
                {getNotificationContent(notification).message}
              </div>
              <div className="notification-time">
                {formatTimeAgo(notification.createdAt)}
              </div>
            </div>

            <div className="notification-actions-item">
              <button
                className="action-btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                title="Remove"
              >
                <FaTimes />
              </button>
            </div>

            {!notification.read && (
              <div className="unread-indicator"></div>
            )}
          </div>
        ))}
      </div>

      {notifications.length > 10 && (
        <div className="notification-footer">
          <Link to="/notifications" className="view-all-link">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
