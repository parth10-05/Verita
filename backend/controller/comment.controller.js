import Comment from '../models/Comment.model.js';
import Question from '../models/Question.model.js';
import Answer from '../models/Answer.model.js';

// Get comments for a question
export const getQuestionComments = async (req, res) => {
  try {
    const { questionId } = req.params;
    const comments = await Comment.find({ questionId })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: 1 });
    
    res.json({ comments });
  } catch (error) {
    console.error('Error getting question comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Get comments for an answer
export const getAnswerComments = async (req, res) => {
  try {
    const { answerId } = req.params;
    const comments = await Comment.find({ answerId })
      .populate('authorId', 'name avatar')
      .sort({ createdAt: 1 });
    
    res.json({ comments });
  } catch (error) {
    console.error('Error getting answer comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Create comment
export const createComment = async (req, res) => {
  try {
    const { body, questionId, answerId } = req.body;
    
    if (!body || (!questionId && !answerId)) {
      return res.status(400).json({ message: 'Comment body and either questionId or answerId are required' });
    }

    const commentData = {
      body,
      authorId: req.user.id
    };

    if (questionId) {
      commentData.questionId = questionId;
    } else if (answerId) {
      commentData.answerId = answerId;
    }

    const comment = new Comment(commentData);
    await comment.save();

    // Populate author info
    await comment.populate('authorId', 'name avatar');

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({ message: 'Comment body is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.body = body;
    await comment.save();

    await comment.populate('authorId', 'name avatar');
    res.json({ comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
}; 