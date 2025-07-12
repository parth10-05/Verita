import express from 'express';
import { auth, requireAdmin } from '../middleware/auth.middleware.js';
import {
    createAdmin,
    getDashboardStats,
    getAllUsers,
    getAllQuestions,
    deleteUser,
    deleteQuestion,
    toggleUserBan,
    getUserDetails
} from '../controller/admin.controller.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

// Create admin (protected by admin secret)
router.post('/create', createAdmin);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/ban', toggleUserBan);

// Question management
router.get('/questions', getAllQuestions);
router.delete('/questions/:questionId', deleteQuestion);

export default router;