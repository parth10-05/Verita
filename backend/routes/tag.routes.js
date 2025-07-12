import express from 'express';
import { getTags, getPopularTags, createTag } from '../controller/tag.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all tags
router.get('/', getTags);

// Get popular tags
router.get('/popular', getPopularTags);

// Create new tag (admin only)
router.post('/', auth, createTag);

export default router; 