import express from 'express';
import { auth, requireAdmin } from '../middleware/auth.middleware.js';
import { createAdmin } from '../controller/admin.controller.js';

const router = express.Router();

// Test route (no auth required)
router.get('/', (req, res) => {
    res.json({message:"Admin routes are working"});
});

// Protected admin routes
router.use(auth); // Apply authentication to all routes below
router.use(requireAdmin); // Require admin role for all routes below

router.post('/create-admin', createAdmin);

export default router;