import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';

// Create a new notification
export const createNotification = async (recipientId, type, referenceType, referenceId, senderId = null) => {
    try {
        // Don't create notification if recipient is the same as sender
        if (senderId && recipientId.toString() === senderId.toString()) {
            return;
        }

        const notification = new Notification({
            recipientId,
            type,
            referenceType,
            referenceId,
            senderId
        });

        await notification.save();
        return notification;
    } catch (err) {
        console.log("Error in createNotification", err);
    }
};

// Get user's notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (page - 1) * limit;

        let query = { recipientId: userId };

        // Filter for unread notifications only
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .populate('senderId', 'username profile_photo')
            .populate('referenceId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            recipientId: userId, 
            isRead: false 
        });

        res.status(200).json({
            notifications,
            total,
            unreadCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in getUserNotifications", err);
        res.status(500).json({ message: err.message });
    }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            isRead: false
        });

        res.status(200).json({
            unreadCount,
            success: true
        });
    } catch (err) {
        console.log("Error in getUnreadCount", err);
        res.status(500).json({ message: err.message });
    }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOne({
            _id: id,
            recipientId: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: "Notification marked as read",
            notification,
            success: true
        });
    } catch (err) {
        console.log("Error in markNotificationAsRead", err);
        res.status(500).json({ message: err.message });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            message: "All notifications marked as read",
            success: true
        });
    } catch (err) {
        console.log("Error in markAllNotificationsAsRead", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipientId: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification deleted successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in deleteNotification", err);
        res.status(500).json({ message: err.message });
    }
};

// Helper function to extract mentions from text
export const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }

    return mentions;
};

// Helper function to create mention notifications
export const createMentionNotifications = async (text, referenceType, referenceId, senderId) => {
    try {
        const mentions = extractMentions(text);
        
        for (const username of mentions) {
            const user = await User.findOne({ username });
            if (user) {
                await createNotification(
                    user._id,
                    'mention',
                    referenceType,
                    referenceId,
                    senderId
                );
            }
        }
    } catch (err) {
        console.log("Error in createMentionNotifications", err);
    }
}; 