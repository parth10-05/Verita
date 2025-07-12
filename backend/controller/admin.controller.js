import User from '../models/User.model.js';
import Question from '../models/Question.model.js';
import Answer from '../models/Answer.model.js';
import bcrypt from 'bcryptjs';

// Special endpoint to create admin (should be protected or one-time use)
export const createAdmin = async (req,res) => {
    try{
        const {username,email,password,adminSecret} = req.body;

        // Check admin secret (you can set this in .env)
        if(adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({message:"Unauthorized to create admin"});
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [ { username }, { email } ] });
        if(existingUser){
            return res.status(400).json({message:"User with the provided username or email already exists."});
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            username,
            email,
            password_hash: hashedPassword,
            role: 'admin'
        });
        await newAdmin.save();

        res.status(201).json({message:"Admin created successfully",success:true});
    }catch(err){
        console.log("Error in createAdmin", err);
        res.status(500).json({message:err.message});
    }
}

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalQuestions = await Question.countDocuments();
        const totalAnswers = await Answer.countDocuments();
        
        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const newQuestions = await Question.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const newAnswers = await Answer.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        res.status(200).json({
            stats: {
                totalUsers,
                totalQuestions,
                totalAnswers,
                newUsers,
                newQuestions,
                newAnswers
            },
            success: true
        });
    } catch (err) {
        console.log("Error in getDashboardStats", err);
        res.status(500).json({ message: err.message });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password_hash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in getAllUsers", err);
        res.status(500).json({ message: err.message });
    }
};

// Get all questions (admin only)
export const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } }
            ];
        }

        const questions = await Question.find(query)
            .populate('authorId', 'username email')
            .populate('tagIds', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Question.countDocuments(query);

        res.status(200).json({
            questions,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in getAllQuestions", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        // Delete user's questions and answers
        await Question.deleteMany({ authorId: userId });
        await Answer.deleteMany({ user_id: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "User deleted successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in deleteUser", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete question (admin only)
export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Delete all answers for this question
        await Answer.deleteMany({ question_id: questionId });

        // Delete the question
        await Question.findByIdAndDelete(questionId);

        res.status(200).json({
            message: "Question deleted successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in deleteQuestion", err);
        res.status(500).json({ message: err.message });
    }
};
