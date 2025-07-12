import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    deleteNotification
} from '../controller/notification.controller.js';

const router = express.Router();

// All notification routes require authentication
router.use(auth);
router.use(requireUser);

// Get user's notifications
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router; 