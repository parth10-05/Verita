import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaClock, FaUser, FaComment, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { questionsAPI, answersAPI, votesAPI } from '../../utils/api';
import { apiUtils } from '../../utils/api';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerContent, setAnswerContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState({});

  // Load question and answers
  useEffect(() => {
    const loadQuestionData = async () => {
      setLoading(true);
      setError('');
      try {
        // Load question
        const questionResponse = await questionsAPI.getQuestion(id);
        setQuestion(questionResponse.data.question);

        // Load answers
        const answersResponse = await answersAPI.getAnswers(id);
        setAnswers(answersResponse.data.answers);

        // Load user votes for answers
        if (user) {
          const votePromises = answersResponse.data.answers.map(answer => 
            votesAPI.getAnswerVote(answer._id)
          );
          const voteResponses = await Promise.all(votePromises);
          const votes = {};
          voteResponses.forEach((response, index) => {
            votes[answersResponse.data.answers[index]._id] = response.data.vote;
          });
          setUserVotes(votes);
        }
      } catch (error) {
        setError(apiUtils.handleError(error));
        if (error.response?.status === 404) {
          navigate('/404');
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuestionData();
  }, [id, user, navigate]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  // Handle answer voting
  const handleAnswerVote = async (answerId, voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      const response = await votesAPI.voteAnswer(answerId, voteType);
      const updatedAnswer = response.data.answer;
      
      setAnswers(prev => prev.map(ans => 
        ans._id === answerId ? updatedAnswer : ans
      ));

      // Update user vote
      const voteResponse = await votesAPI.getAnswerVote(answerId);
      setUserVotes(prev => ({
        ...prev,
        [answerId]: voteResponse.data.vote
      }));
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Handle question voting
  const handleQuestionVote = async (voteType) => {
    if (!user) {
      setError('Please log in to vote');
      return;
    }

    try {
      const response = await votesAPI.voteQuestion(id, voteType);
      setQuestion(response.data.question);
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Accept/unaccept answer
  const handleAcceptAnswer = async (answerId, accept) => {
    if (!user || question.authorId._id !== user.id) {
      setError('Only the question author can accept answers');
      return;
    }

    try {
      if (accept) {
        await answersAPI.acceptAnswer(answerId);
      } else {
        await answersAPI.unacceptAnswer(answerId);
      }

      // Reload answers to get updated accepted status
      const answersResponse = await answersAPI.getAnswers(id);
      setAnswers(answersResponse.data.answers);
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Submit new answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    console.log('Answer submission started');
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to post an answer');
      return;
    }

    if (!answerContent.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Making API call to create answer for question:', id);
      const response = await answersAPI.createAnswer(id, { content: answerContent });
      console.log('Answer created successfully:', response.data);
      setAnswers(prev => [response.data.answer, ...prev]);
      setAnswerContent('');
      setSuccess('Answer posted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating answer:', error);
      setError(apiUtils.handleError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="main-content">
        <div className="error-message">Question not found</div>
      </div>
    );
  }

  const isQuestionOwner = user && question.authorId._id === user.id;

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="question-detail-container">
        {/* Question Card */}
        <motion.div className="card question-detail-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="question-header">
            <h1 className="question-title">{question.title}</h1>
            <div className="question-meta">
              <div className="meta-item">
                <FaClock />
                <span>{formatTimeAgo(question.createdAt)}</span>
              </div>
              <div className="meta-item">
                <FaUser />
                <span>{question.authorId.username}</span>
              </div>
              <div className="meta-item">
                <FaComment />
                <span>{answers.length} {answers.length === 1 ? 'answer' : 'answers'}</span>
              </div>
            </div>
          </div>
          
          <div className="question-content">
            <div className="question-description" dangerouslySetInnerHTML={{ __html: question.body }} />
            <div className="question-tags">
              {question.tagIds.map(tag => (
                <span key={tag._id} className="tag">{tag.name}</span>
              ))}
            </div>
          </div>

          {/* Question voting */}
          <div className="question-voting">
            <button
              className={`vote-btn upvote ${userVotes[question._id]?.value === 1 ? 'active' : ''}`}
              onClick={() => handleQuestionVote('upvote')}
              disabled={!user}
            >
              <FaThumbsUp />
            </button>
            <span className="vote-count">{question.upvotes - question.downvotes}</span>
            <button
              className={`vote-btn downvote ${userVotes[question._id]?.value === -1 ? 'active' : ''}`}
              onClick={() => handleQuestionVote('downvote')}
              disabled={!user}
            >
              <FaThumbsDown />
            </button>
          </div>
        </motion.div>

        {/* Answers Section */}
        <motion.div className="answers-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h3 className="answers-title">Answers ({answers.length})</h3>
          
          <AnimatePresence>
            {error && (
              <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div className="success-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="answers-list">
            {answers.map((answer, index) => (
              <motion.div
                key={answer._id}
                className={`answer-card ${answer.is_accepted ? 'accepted' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="answer-header">
                  <div className="answer-author">
                    <img
                      src={answer.user_id.profile_photo || `https://ui-avatars.com/api/?name=${answer.user_id.username}&background=667eea&color=fff&size=32`}
                      alt={answer.user_id.username}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <span className="author-name">{answer.user_id.username}</span>
                      <span className="answer-date">{formatTimeAgo(answer.created_at)}</span>
                    </div>
                  </div>
                  {answer.is_accepted && (
                    <span className="accepted-badge">
                      <FaCheck /> Accepted
                    </span>
                  )}
                </div>
                
                <div className="answer-content" dangerouslySetInnerHTML={{ __html: answer.content }} />
                
                <div className="answer-footer">
                  <div className="answer-voting">
                    <button
                      className={`vote-btn upvote ${userVotes[answer._id]?.value === 1 ? 'active' : ''}`}
                      onClick={() => handleAnswerVote(answer._id, 'upvote')}
                      disabled={!user}
                    >
                      <FaThumbsUp />
                    </button>
                    <span className="vote-count">{answer.upvotes - answer.downvotes}</span>
                    <button
                      className={`vote-btn downvote ${userVotes[answer._id]?.value === -1 ? 'active' : ''}`}
                      onClick={() => handleAnswerVote(answer._id, 'downvote')}
                      disabled={!user}
                    >
                      <FaThumbsDown />
                    </button>
                  </div>
                  
                  {isQuestionOwner && (
                    <div className="answer-actions">
                      {answer.is_accepted ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleAcceptAnswer(answer._id, false)}
                        >
                          Unaccept
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptAnswer(answer._id, true)}
                        >
                          Accept Answer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Answer Form */}
        {user ? (
          <motion.div className="answer-form-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="card">
              <h4 className="answer-form-title">Your Answer</h4>
              <form onSubmit={handleAnswerSubmit}>
                <div className="form-group">
                  <label className="form-label">Answer Content</label>
                  <RichTextEditor
                    value={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your detailed answer here. You can use the toolbar above to format your text, add links, images, and more..."
                  />
                  <div className="form-hint">
                    Use the toolbar to format your answer. You can add <strong>bold text</strong>, <em>italics</em>, lists, links, and images to make your answer more helpful.
                  </div>
                </div>
                
                <div className="form-actions">
                  <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="loading-spinner"></span>
                        Posting Answer...
                      </>
                    ) : (
                      'Post Answer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div className="auth-required" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="card">
              <h4>Want to answer this question?</h4>
              <p>Please log in to post an answer.</p>
              <div className="auth-actions">
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  Log In
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/register')}>
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuestionDetail;
