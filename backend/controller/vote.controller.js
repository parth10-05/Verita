import Vote from '../models/Vote.model.js';
import Question from '../models/Question.model.js';
import Answer from '../models/Answer.model.js';

// Vote on a question or answer
export const vote = async (req, res) => {
    try {
        const { targetType, targetId, value } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!targetType || !targetId || !value) {
            return res.status(400).json({ 
                message: "Target type, target ID, and vote value are required" 
            });
        }

        if (!['question', 'answer'].includes(targetType)) {
            return res.status(400).json({ 
                message: "Target type must be 'question' or 'answer'" 
            });
        }

        if (![1, -1].includes(value)) {
            return res.status(400).json({ 
                message: "Vote value must be 1 (upvote) or -1 (downvote)" 
            });
        }

        // Check if target exists
        let target;
        if (targetType === 'question') {
            target = await Question.findById(targetId);
        } else {
            target = await Answer.findById(targetId);
        }

        if (!target) {
            return res.status(404).json({ 
                message: `${targetType} not found` 
            });
        }

        // Check if user is voting on their own content
        const targetAuthorId = targetType === 'question' ? target.authorId : target.user_id;
        if (targetAuthorId.toString() === userId.toString()) {
            return res.status(400).json({ 
                message: "You cannot vote on your own content" 
            });
        }

        // Check if user has already voted
        let existingVote = await Vote.findOne({
            userId,
            targetType,
            targetId
        });

        let upvoteChange = 0;
        let downvoteChange = 0;

        if (existingVote) {
            // User has already voted
            if (existingVote.value === value) {
                // Same vote - remove it (toggle off)
                await Vote.findByIdAndDelete(existingVote._id);
                if (value === 1) {
                    upvoteChange = -1; // Remove upvote
                } else {
                    downvoteChange = -1; // Remove downvote
                }
            } else {
                // Different vote - change it
                if (existingVote.value === 1) {
                    upvoteChange = -1; // Remove old upvote
                } else {
                    downvoteChange = -1; // Remove old downvote
                }
                
                existingVote.value = value;
                await existingVote.save();
                
                if (value === 1) {
                    upvoteChange += 1; // Add new upvote
                } else {
                    downvoteChange += 1; // Add new downvote
                }
            }
        } else {
            // New vote
            const newVote = new Vote({
                userId,
                targetType,
                targetId,
                value
            });
            await newVote.save();
            
            if (value === 1) {
                upvoteChange = 1; // Add upvote
            } else {
                downvoteChange = 1; // Add downvote
            }
        }

        // Update the target's vote counts
        if (targetType === 'question') {
            await Question.findByIdAndUpdate(targetId, {
                $inc: { 
                    upvotes: upvoteChange,
                    downvotes: downvoteChange
                }
            });
        } else {
            await Answer.findByIdAndUpdate(targetId, {
                $inc: { 
                    upvotes: upvoteChange,
                    downvotes: downvoteChange
                }
            });
        }

        // Get updated target with new vote count
        let updatedTarget;
        if (targetType === 'question') {
            updatedTarget = await Question.findById(targetId)
                .populate('authorId', 'username profile_photo accepted_answers_count');
        } else {
            updatedTarget = await Answer.findById(targetId)
                .populate('user_id', 'username profile_photo accepted_answers_count');
        }

        res.status(200).json({
            message: "Vote recorded successfully",
            target: updatedTarget,
            success: true
        });
    } catch (err) {
        console.log("Error in vote", err);
        res.status(500).json({ message: err.message });
    }
};

// Vote on a question
export const voteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { voteType } = req.body;
        const userId = req.user._id;

        // Validate vote type
        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ 
                message: "Vote type must be 'upvote' or 'downvote'" 
            });
        }

        const value = voteType === 'upvote' ? 1 : -1;

        // Check if question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check if user is voting on their own content
        if (question.authorId.toString() === userId.toString()) {
            return res.status(400).json({ 
                message: "You cannot vote on your own content" 
            });
        }

        // Check if user has already voted
        let existingVote = await Vote.findOne({
            userId,
            targetType: 'question',
            targetId: questionId
        });

        let upvoteChange = 0;
        let downvoteChange = 0;

        if (existingVote) {
            // User has already voted
            if (existingVote.value === value) {
                // Same vote - remove it (toggle off)
                await Vote.findByIdAndDelete(existingVote._id);
                if (value === 1) {
                    upvoteChange = -1; // Remove upvote
                } else {
                    downvoteChange = -1; // Remove downvote
                }
            } else {
                // Different vote - change it
                if (existingVote.value === 1) {
                    upvoteChange = -1; // Remove old upvote
                } else {
                    downvoteChange = -1; // Remove old downvote
                }
                
                existingVote.value = value;
                await existingVote.save();
                
                if (value === 1) {
                    upvoteChange += 1; // Add new upvote
                } else {
                    downvoteChange += 1; // Add new downvote
                }
            }
        } else {
            // New vote
            const newVote = new Vote({
                userId,
                targetType: 'question',
                targetId: questionId,
                value
            });
            await newVote.save();
            
            if (value === 1) {
                upvoteChange = 1; // Add upvote
            } else {
                downvoteChange = 1; // Add downvote
            }
        }

        // Update the question's vote counts
        await Question.findByIdAndUpdate(questionId, {
            $inc: { 
                upvotes: upvoteChange,
                downvotes: downvoteChange
            }
        });

        // Get updated question with new vote count
        const updatedQuestion = await Question.findById(questionId)
            .populate('authorId', 'username profile_photo accepted_answers_count');

        res.status(200).json({
            message: "Vote recorded successfully",
            question: updatedQuestion,
            success: true
        });
    } catch (err) {
        console.log("Error in voteQuestion", err);
        res.status(500).json({ message: err.message });
    }
};

// Vote on an answer
export const voteAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const { voteType } = req.body;
        const userId = req.user._id;

        // Validate vote type
        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ 
                message: "Vote type must be 'upvote' or 'downvote'" 
            });
        }

        const value = voteType === 'upvote' ? 1 : -1;

        // Check if answer exists
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found" });
        }

        // Check if user is voting on their own content
        if (answer.user_id.toString() === userId.toString()) {
            return res.status(400).json({ 
                message: "You cannot vote on your own content" 
            });
        }

        // Check if user has already voted
        let existingVote = await Vote.findOne({
            userId,
            targetType: 'answer',
            targetId: answerId
        });

        let upvoteChange = 0;
        let downvoteChange = 0;

        if (existingVote) {
            // User has already voted
            if (existingVote.value === value) {
                // Same vote - remove it (toggle off)
                await Vote.findByIdAndDelete(existingVote._id);
                if (value === 1) {
                    upvoteChange = -1; // Remove upvote
                } else {
                    downvoteChange = -1; // Remove downvote
                }
            } else {
                // Different vote - change it
                if (existingVote.value === 1) {
                    upvoteChange = -1; // Remove old upvote
                } else {
                    downvoteChange = -1; // Remove old downvote
                }
                
                existingVote.value = value;
                await existingVote.save();
                
                if (value === 1) {
                    upvoteChange += 1; // Add new upvote
                } else {
                    downvoteChange += 1; // Add new downvote
                }
            }
        } else {
            // New vote
            const newVote = new Vote({
                userId,
                targetType: 'answer',
                targetId: answerId,
                value
            });
            await newVote.save();
            
            if (value === 1) {
                upvoteChange = 1; // Add upvote
            } else {
                downvoteChange = 1; // Add downvote
            }
        }

        // Update the answer's vote counts
        await Answer.findByIdAndUpdate(answerId, {
            $inc: { 
                upvotes: upvoteChange,
                downvotes: downvoteChange
            }
        });

        // Get updated answer with new vote count
        const updatedAnswer = await Answer.findById(answerId)
            .populate('user_id', 'username profile_photo accepted_answers_count');

        res.status(200).json({
            message: "Vote recorded successfully",
            answer: updatedAnswer,
            success: true
        });
    } catch (err) {
        console.log("Error in voteAnswer", err);
        res.status(500).json({ message: err.message });
    }
};

// Get user's vote on a question
export const getQuestionVote = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = req.user._id;

        const vote = await Vote.findOne({
            userId,
            targetType: 'question',
            targetId: questionId
        });

        res.status(200).json({
            vote: vote ? { value: vote.value } : null,
            success: true
        });
    } catch (err) {
        console.log("Error in getQuestionVote", err);
        res.status(500).json({ message: err.message });
    }
};

// Get user's vote on an answer
export const getAnswerVote = async (req, res) => {
    try {
        const { answerId } = req.params;
        const userId = req.user._id;

        const vote = await Vote.findOne({
            userId,
            targetType: 'answer',
            targetId: answerId
        });

        res.status(200).json({
            vote: vote ? { value: vote.value } : null,
            success: true
        });
    } catch (err) {
        console.log("Error in getAnswerVote", err);
        res.status(500).json({ message: err.message });
    }
};
