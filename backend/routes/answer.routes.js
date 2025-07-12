import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    createAnswer,
    getAnswersByQuestion,
    getAnswerById,
    updateAnswer,
    deleteAnswer,
    acceptAnswer
} from '../controller/answer.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/question/:questionId', getAnswersByQuestion);
router.get('/:id', getAnswerById);

// Protected routes (authentication required)
router.use(auth);
router.use(requireUser);

router.post('/', createAnswer);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer);
router.post('/:id/accept', acceptAnswer);

export default router; 