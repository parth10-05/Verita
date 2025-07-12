import User from '../models/User.model.js';
import Question from '../models/Question.model.js';
import Answer from '../models/Answer.model.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [questionCount, answerCount, acceptedAnswerCount] = await Promise.all([
      Question.countDocuments({ authorId: userId }),
      Answer.countDocuments({ user_id: userId }),
      Answer.countDocuments({ user_id: userId, is_accepted: true })
    ]);

    const stats = {
      questionCount,
      answerCount,
      acceptedAnswerCount,
      totalVotes: 0 // This would need to be calculated from Vote model
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
};

// Get user questions
export const getUserQuestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'latest' } = req.query;
    
    const skip = (page - 1) * limit;
    let sortOption = {};
    
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { upvotes: -1 };
        break;
      case 'most-answered':
        sortOption = { answerCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find({ authorId: userId })
      .populate('authorId', 'username email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Add answer count to each question
    const questionsWithAnswerCount = await Promise.all(
      questions.map(async (question) => {
        const answerCount = await Answer.countDocuments({ question_id: question._id });
        return {
          ...question.toObject(),
          answerCount
        };
      })
    );

    const total = await Question.countDocuments({ authorId: userId });

    res.json({ 
      questions: questionsWithAnswerCount, 
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + questionsWithAnswerCount.length < total
      }
    });
  } catch (error) {
    console.error('Error getting user questions:', error);
    res.status(500).json({ message: 'Error fetching user questions' });
  }
};

// Get user answers
export const getUserAnswers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sort = 'latest' } = req.query;
    
    const skip = (page - 1) * limit;
    let sortOption = {};
    
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { upvotes: -1 };
        break;
      case 'accepted':
        sortOption = { is_accepted: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const answers = await Answer.find({ user_id: userId })
      .populate('user_id', 'username email')
      .populate('question_id', 'title')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Answer.countDocuments({ user_id: userId });

    res.json({ 
      answers, 
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasMore: skip + answers.length < total
      }
    });
  } catch (error) {
    console.error('Error getting user answers:', error);
    res.status(500).json({ message: 'Error fetching user answers' });
  }
}; 