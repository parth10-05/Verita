import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} from '../controller/question.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);

// Protected routes (authentication required)
router.use(auth);
router.use(requireUser);

router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router; 