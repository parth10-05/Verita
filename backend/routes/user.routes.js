import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserStats, 
  getUserQuestions, 
  getUserAnswers 
} from '../controller/user.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user profile
router.get('/:userId', getUserProfile);

// Update user profile
router.put('/profile', auth, updateUserProfile);

// Get user stats
router.get('/:userId/stats', getUserStats);

// Get user questions
router.get('/:userId/questions', getUserQuestions);

// Get user answers
router.get('/:userId/answers', getUserAnswers);

export default router; 