import express from 'express';
import { 
  getQuestionComments, 
  getAnswerComments, 
  createComment, 
  updateComment, 
  deleteComment 
} from '../controller/comment.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get comments for a question
router.get('/questions/:questionId', getQuestionComments);

// Get comments for an answer
router.get('/answers/:answerId', getAnswerComments);

// Create comment
router.post('/', auth, createComment);

// Update comment
router.put('/:commentId', auth, updateComment);

// Delete comment
router.delete('/:commentId', auth, deleteComment);

export default router; 