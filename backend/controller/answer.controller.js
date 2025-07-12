import Answer from '../models/Answer.model.js';
import Question from '../models/Question.model.js';
import User from '../models/User.model.js';
import { createNotification, createMentionNotifications } from './notification.controller.js';

// Create a new answer
export const createAnswer = async (req, res) => {
    try {
        const { question_id, content } = req.body;
        const user_id = req.user._id;

        // Validate required fields
        if (!question_id || !content) {
            return res.status(400).json({ 
                message: "Question ID and content are required" 
            });
        }

        // Check if question exists
        const question = await Question.findById(question_id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Create new answer
        const newAnswer = new Answer({
            question_id,
            user_id,
            content
        });

        await newAnswer.save();

        // Create notification for question author
        await createNotification(
            question.authorId,
            'new_answer',
            'question',
            question_id,
            user_id
        );

        // Check for mentions in answer content
        await createMentionNotifications(
            content,
            'answer',
            newAnswer._id,
            user_id
        );

        // Populate user info
        await newAnswer.populate('user_id', 'username profile_photo accepted_answers_count');

        res.status(201).json({
            message: "Answer created successfully",
            answer: newAnswer,
            success: true
        });
    } catch (err) {
        console.log("Error in createAnswer", err);
        res.status(500).json({ message: err.message });
    }
};

// Get answers for a question
export const getAnswersByQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        console.log('Getting answers for question:', questionId);

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            console.log('Question not found:', questionId);
            return res.status(404).json({ message: "Question not found" });
        }

        console.log('Question found, fetching answers...');

        const answers = await Answer.find({ question_id: questionId })
            .populate('user_id', 'username profile_photo accepted_answers_count')
            .sort({ is_accepted: -1, upvotes: -1, downvotes: 1, created_at: -1 }) // Accepted first, then by net votes, then by date
            .skip(skip)
            .limit(parseInt(limit));

        console.log('Answers fetched:', answers.length);

        const total = await Answer.countDocuments({ question_id: questionId });

        res.status(200).json({
            answers,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            success: true
        });
    } catch (err) {
        console.log("Error in getAnswersByQuestion", err);
        console.log("Error stack:", err.stack);
        res.status(500).json({ message: err.message });
    }
};

// Get answer by ID
export const getAnswerById = async (req, res) => {
    try {
        const { id } = req.params;

        const answer = await Answer.findById(id)
            .populate('user_id', 'username profile_photo accepted_answers_count')
            .populate('question_id', 'title');

        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        res.status(200).json({
            answer,
            success: true
        });
    } catch (err) {
        console.log("Error in getAnswerById", err);
        res.status(500).json({ message: err.message });
    }
};

// Update answer
export const updateAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const answer = await Answer.findById(id);

        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Check if user is the author or admin
        if (answer.user_id.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to update this answer" });
        }

        // Update content
        if (content) {
            answer.content = content;
            answer.updated_at = new Date();
        }

        await answer.save();

        // Populate user info
        await answer.populate('user_id', 'username profile_photo accepted_answers_count');

        res.status(200).json({
            message: "Answer updated successfully",
            answer,
            success: true
        });
    } catch (err) {
        console.log("Error in updateAnswer", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete answer
export const deleteAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const answer = await Answer.findById(id);

        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Check if user is the author or admin
        if (answer.user_id.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this answer" });
        }

        await Answer.findByIdAndDelete(id);

        res.status(200).json({
            message: "Answer deleted successfully",
            success: true
        });
    } catch (err) {
        console.log("Error in deleteAnswer", err);
        res.status(500).json({ message: err.message });
    }
};

// Accept answer (only question author can accept)
export const acceptAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Get the question to check if user is the author
        const question = await Question.findById(answer.question_id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if user is the question author
        if (question.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only question author can accept answers" });
        }

        // Unaccept all other answers for this question
        await Answer.updateMany(
            { question_id: answer.question_id },
            { is_accepted: false }
        );

        // Accept this answer
        answer.is_accepted = true;
        await answer.save();

        res.status(200).json({
            message: "Answer accepted successfully",
            answer,
            success: true
        });
    } catch (err) {
        console.log("Error in acceptAnswer", err);
        res.status(500).json({ message: err.message });
    }
}; 

// Unaccept answer (only question author can unaccept)
export const unacceptAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Get the question to check if user is the author
        const question = await Question.findById(answer.question_id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if user is the question author
        if (question.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only question author can unaccept answers" });
        }

        // Unaccept this answer
        answer.is_accepted = false;
        await answer.save();

        res.status(200).json({
            message: "Answer unaccepted successfully",
            answer,
            success: true
        });
    } catch (err) {
        console.log("Error in unacceptAnswer", err);
        res.status(500).json({ message: err.message });
    }
}; 