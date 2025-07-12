import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateAndSendOTP } from '../utils/email.js';

export const loginUser = async (req,res) => {
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});   
        if(!user) {
            return res.status(400).json({message:"Invalid Credentials"});
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if(isPasswordValid){
            // Generate JWT token
            const token = jwt.sign(
                {id: user._id, role: user.role}, 
                process.env.JWT_SECRET, 
                {expiresIn: "1h"}
            );
            
            // Set HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000 // 1 hour
            });
            
            // Return token in response as well
            res.status(200).json({
                message: "User logged in successfully",
                user: {
                    _id: user._id,
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                success: true,
                token: token
            });
        }else{
            res.status(400).json({message:"Invalid Credentials"});
        }
    }catch(err){
        console.log("Error in loginUser",err);
        res.status(500).json({message:err.message});
    }
}

export const registerUser = async (req,res) => {
    try{
        const {username,email,password} = req.body;

        const existingUser = await User.findOne({ $or: [ { username }, { email } ] });

        if(existingUser){
            return res.status(400).json({message:"User with the provided username or email already exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password_hash: hashedPassword,
            role: 'user'
        });
        await newUser.save();

        res.status(201).json({message:"User registered successfully",success:true});
    }catch(err){
        console.log("Error in registerUser", err);
        res.status(500).json({message:err.message});
    }
}

export const logoutUser = async (req, res) => {
    try {
        // Clear the cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.status(200).json({
            message: "User logged out successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in logoutUser", err);
        res.status(500).json({message: err.message});
    }
}

// Forgot Password - Send OTP
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }

        // Generate and send OTP
        const otp = await generateAndSendOTP(user, 'Password Reset OTP');
        
        res.status(200).json({ 
            message: "Password reset OTP sent to your email", 
            success: true 
        });
    } catch (err) {
        console.log("Error in sendOtp", err);
        res.status(500).json({ message: err.message });
    }
};

// Forgot Password - Verify OTP
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordTokenOtp: otp,
            resetPasswordExpiresOtp: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP fields
        user.resetPasswordTokenOtp = null;
        user.resetPasswordExpiresOtp = null;
        await user.save();
        
        res.status(200).json({ 
            message: "OTP verified successfully", 
            success: true 
        });
    } catch (err) {
        console.log("Error in verifyOtp", err);
        res.status(500).json({ message: err.message });
    }
};

// Forgot Password - Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password_hash = hashedPassword;
        user.resetPasswordTokenOtp = null;
        user.resetPasswordExpiresOtp = null;
        await user.save();
        
        res.status(200).json({ 
            message: "Password reset successfully", 
            success: true 
        });
    } catch (err) {
        console.log("Error in resetPassword", err);
        res.status(500).json({ message: err.message });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        // The user ID is available from the auth middleware
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password_hash');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            user: {
                _id: user._id,
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                reputation: user.reputation,
                createdAt: user.createdAt
            },
            success: true
        });
    } catch (err) {
        console.log("Error in getCurrentUser", err);
        res.status(500).json({ message: err.message });
    }
};
