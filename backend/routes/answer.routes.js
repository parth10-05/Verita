import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    createAnswer,
    getAnswersByQuestion,
    getAnswerById,
    updateAnswer,
    deleteAnswer,
    acceptAnswer,
    unacceptAnswer
} from '../controller/answer.controller.js';
import { voteAnswer, getAnswerVote } from '../controller/vote.controller.js';

const router = express.Router();

// Wrapper functions to map route parameters
const voteAnswerById = async (req, res) => {
    req.params.answerId = req.params.id;
    return voteAnswer(req, res);
};

const getAnswerVoteById = async (req, res) => {
    req.params.answerId = req.params.id;
    return getAnswerVote(req, res);
};

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
router.post('/:id/unaccept', unacceptAnswer);

// Vote on an answer
router.post('/:id/vote', voteAnswerById);
router.get('/:id/vote', getAnswerVoteById);

export default router; 