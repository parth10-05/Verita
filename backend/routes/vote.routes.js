import express from 'express';
import { auth, requireUser } from '../middleware/auth.middleware.js';
import { vote } from '../controller/vote.controller.js';

const router = express.Router();

// All vote routes require authentication
router.use(auth);
router.use(requireUser);

// Vote on a question or answer
router.post('/', vote);


export default router; 