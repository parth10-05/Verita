import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import {
    vote,
    voteQuestion,
    voteAnswer,
    getQuestionVote,
    getAnswerVote
} from '../controller/vote.controller.js';

const router = express.Router();

// Protected routes (authentication required)
router.use(auth);
router.use(requireUser);

// Generic vote route
router.post('/', vote);

// Question vote routes
router.post('/questions/:questionId', voteQuestion);
router.get('/questions/:questionId', getQuestionVote);

// Answer vote routes
router.post('/answers/:answerId', voteAnswer);
router.get('/answers/:answerId', getAnswerVote);

export default router; 