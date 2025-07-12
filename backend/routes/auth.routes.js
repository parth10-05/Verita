import express from 'express';
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    sendOtp, 
    verifyOtp, 
    resetPassword 
} from '../controller/auth.controller.js';

const router = express.Router();

// Authentication routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);

// Forgot password routes
router.post('/forgot-password/send-otp', sendOtp);
router.post('/forgot-password/verify-otp', verifyOtp);
router.post('/forgot-password/reset-password', resetPassword);

export default router;