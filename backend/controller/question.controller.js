import Question from '../models/Question.model.js';
import User from '../models/User.model.js';
import Tag from '../models/Tag.model.js';
import { createMentionNotifications } from './notification.controller.js';

// Create a new question
export const createQuestion = async (req, res) => {
    try {
        const { title, body } = req.body;
        const authorId = req.user._id;

        // Validate required fields
        if (!title || !body) {
            return res.status(400).json({ 
                message: "Title and body are required" 
            });
        }

        // Create new question (tags will be added later by Python service)
        const newQuestion = new Question({
            authorId,
            title,
            body,
            tagIds: [] // Empty array for now, will be populated by AI service
        });

        await newQuestion.save();

        // Check for mentions in question content
        await createMentionNotifications(
            body,
            'question',
            newQuestion._id,
            authorId
        );

        // Populate author info
        await newQuestion.populate('authorId', 'username profile_photo accepted_answers_count');

        res.status(201).json({
            message: "Question created successfully",
            question: newQuestion,
            success: true,
            note: "Tags will be automatically generated and added to this question"
        });
    } catch (err) {
        console.log("Error in createQuestion", err);
        res.status(500).json({ message: err.message });
    }
};

// Get all questions
export const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, tag, search } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        // Filter by tag
        if (tag) {
            const tagDoc = await Tag.findOne({ slug: tag });
            if (tagDoc) {
                query.tagIds = tagDoc._id;
            }
        }

        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { body: { $regex: search, $options: 'i' } }
            ];
        }

        const questions = await Question.find(query)
            .populate('authorId', 'username profile_photo accepted_answers_count')
            .populate('tagIds', 'name slug')
            .sort({ $expr: { $subtract: ["$upvotes", "$downvotes"] } }, { createdAt: -1 }) // Sort by net votes first, then by date
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

// Get question by ID
export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id)
            .populate('authorId', 'username profile_photo accepted_answers_count')
            .populate('tagIds', 'name slug');

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.status(200).json({
            question,
            success: true
        });
    } catch (err) {
        console.log("Error in getQuestionById", err);
        res.status(500).json({ message: err.message });
    }
};

// Update question
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, tagIds } = req.body;
        const userId = req.user._id;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if user is the author or admin
        if (question.authorId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to update this question" });
        }

        // Update fields
        if (title) question.title = title;
        if (body) question.body = body;
        if (tagIds) question.tagIds = tagIds;
        question.updatedAt = new Date();

        await question.save();

        // Populate author info
        await question.populate('authorId', 'username profile_photo accepted_answers_count');
        await question.populate('tagIds', 'name slug');

        res.status(200).json({
            message: "Question updated successfully",
            question,
            success: true
        });
    } catch (err) {
        console.log("Error in updateQuestion", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if user is the author or admin
        if (question.authorId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this question" });
        }

        await Question.findByIdAndDelete(id);

        res.status(200).json({
            message: "Question deleted successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in deleteQuestion", err);
        res.status(500).json({ message: err.message });
    }
}; 