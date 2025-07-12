import Question from '../models/Question.model.js';
import User from '../models/User.model.js';
import Tag from '../models/Tag.model.js';
import { createMentionNotifications } from './notification.controller.js';

// Create a new question
export const createQuestion = async (req, res) => {
    try {
        console.log('Received createQuestion request body:', req.body);
        const { title, body, tags = [] } = req.body;
        const authorId = req.user._id;

        // Validate required fields
        if (!title || !body) {
            console.log('Validation failed: missing title or body');
            return res.status(400).json({ 
                message: "Title and body are required" 
            });
        }
        if (!Array.isArray(tags) || tags.length === 0) {
            console.log('Validation failed: tags missing or empty', tags);
            return res.status(400).json({
                message: "At least one tag is required"
            });
        }
        if (!tags.every(tag => typeof tag === 'string' && tag.trim().length > 0)) {
            console.log('Validation failed: tags not all non-empty strings', tags);
            return res.status(400).json({
                message: "All tags must be non-empty strings"
            });
        }

        // Process tags: find or create, and collect their IDs
        const tagIds = [];
        for (let tagName of tags) {
            tagName = tagName.trim().toLowerCase();
            if (!tagName) continue;
            let tag = await Tag.findOne({ name: tagName });
            if (!tag) {
                // Create slug (replace spaces with dashes, remove non-alphanum except dash)
                const slug = tagName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                tag = new Tag({ name: tagName, slug });
                await tag.save();
            }
            tagIds.push(tag._id);
        }

        // Create new question with tagIds
        const newQuestion = new Question({
            authorId,
            title,
            body,
            tagIds
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
        await newQuestion.populate('tagIds', 'name slug');

        res.status(201).json({
            message: "Question created successfully",
            question: newQuestion,
            success: true
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

// Get questions by user ID
export const getUserQuestions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const questions = await Question.find({ authorId: userId })
            .populate('authorId', 'username profile_photo accepted_answers_count')
            .populate('tagIds', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Question.countDocuments({ authorId: userId });

        res.status(200).json({
            questions,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in getUserQuestions", err);
        res.status(500).json({ message: err.message });
    }
};

// Search questions
export const searchQuestions = async (req, res) => {
    try {
        const { q: query } = req.query;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { body: { $regex: query, $options: 'i' } }
            ]
        };

        const questions = await Question.find(searchQuery)
            .populate('authorId', 'username profile_photo accepted_answers_count')
            .populate('tagIds', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Question.countDocuments(searchQuery);

        res.status(200).json({
            questions,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in searchQuestions", err);
        res.status(500).json({ message: err.message });
    }
}; 