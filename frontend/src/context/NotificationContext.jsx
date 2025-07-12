import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load notifications from localStorage on app start
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error parsing notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save notifications to localStorage whenever they change
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Helper functions for common notification types
  const notifyAnswerReceived = (questionTitle, answerAuthor) => {
    addNotification({
      type: 'answer',
      title: 'New Answer',
      message: `${answerAuthor} answered your question: "${questionTitle}"`,
      link: `/question/${questionTitle}`,
      icon: 'answer'
    });
  };

  const notifyCommentReceived = (answerAuthor, commentAuthor) => {
    addNotification({
      type: 'comment',
      title: 'New Comment',
      message: `${commentAuthor} commented on your answer`,
      icon: 'comment'
    });
  };

  const notifyMention = (mentionedBy, content) => {
    addNotification({
      type: 'mention',
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you: "${content}"`,
      icon: 'mention'
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    notifyAnswerReceived,
    notifyCommentReceived,
    notifyMention
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Export the context object for direct usage
export { NotificationContext };
