import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getUserQuestions,
    searchQuestions
} from '../controller/question.controller.js';
import { getAnswersByQuestion, createAnswer } from '../controller/answer.controller.js';
import { voteQuestion, getQuestionVote } from '../controller/vote.controller.js';

const router = express.Router();

// Wrapper functions to map route parameters
const getAnswersForQuestion = async (req, res) => {
    req.params.questionId = req.params.id;
    return getAnswersByQuestion(req, res);
};

const voteQuestionById = async (req, res) => {
    req.params.questionId = req.params.id;
    return voteQuestion(req, res);
};

const getQuestionVoteById = async (req, res) => {
    req.params.questionId = req.params.id;
    return getQuestionVote(req, res);
};

// Wrapper for creating an answer for a question
const createAnswerForQuestion = async (req, res) => {
    req.body.question_id = req.params.id;
    return createAnswer(req, res);
};

// Public routes (no authentication required)
router.get('/', getAllQuestions);
router.get('/search', searchQuestions);
router.get('/user/:userId', getUserQuestions);
router.get('/:id', getQuestionById);

// Get answers for a specific question (public route)
router.get('/:id/answers', getAnswersForQuestion);

// Protected routes (authentication required)
router.use(auth);
router.use(requireUser);

router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

// Create answer for a question
router.post('/:id/answers', createAnswerForQuestion);

// Vote on a question
router.post('/:id/vote', voteQuestionById);
router.get('/:id/vote', getQuestionVoteById);

export default router; 