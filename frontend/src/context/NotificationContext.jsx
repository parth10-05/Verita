import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsAPI, apiUtils } from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load notifications from API
  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
      // Update unread count if the notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Helper functions for common notification types
  const notifyAnswerReceived = (questionTitle, answerAuthor) => {
    // This would typically be handled by the backend when an answer is created
    console.log('Answer notification:', { questionTitle, answerAuthor });
  };

  const notifyCommentReceived = (answerAuthor, commentAuthor) => {
    // This would typically be handled by the backend when a comment is created
    console.log('Comment notification:', { answerAuthor, commentAuthor });
  };

  const notifyMention = (mentionedBy, content) => {
    // This would typically be handled by the backend when a mention is detected
    console.log('Mention notification:', { mentionedBy, content });
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    notifyAnswerReceived,
    notifyCommentReceived,
    notifyMention,
    loadNotifications,
    loadUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext };
