import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

const mockQuestion = {
  id: '1',
  title: 'How to implement authentication in React with JWT?',
  description: '<p>I\'m building a React application and need to implement user authentication using JWT tokens. What\'s the best approach?</p>',
  author: { name: 'John Doe', avatar: null, id: '1' },
  tags: ['React', 'JWT', 'Authentication'],
  createdAt: '2024-01-15T10:30:00Z',
};

const mockAnswers = [
  {
    id: 'a1',
    author: { name: 'Jane Smith', avatar: null, id: '2' },
    content: '<p>You can use <b>jsonwebtoken</b> on the backend and store the token in localStorage or cookies on the frontend.</p>',
    createdAt: '2024-01-16T12:00:00Z',
    votes: 5,
    isAccepted: false
  },
  {
    id: 'a2',
    author: { name: 'Mike Johnson', avatar: null, id: '3' },
    content: '<p>Consider using <i>httpOnly</i> cookies for better security.</p>',
    createdAt: '2024-01-16T13:30:00Z',
    votes: 3,
    isAccepted: true
  }
];

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [answers, setAnswers] = useState(mockAnswers);
  const [answerContent, setAnswerContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Voting logic (mock)
  const handleVote = (answerId, delta) => {
    setAnswers(prev => prev.map(ans =>
      ans.id === answerId ? { ...ans, votes: ans.votes + delta } : ans
    ));
  };

  // Accept answer logic (only question owner)
  const handleAccept = (answerId) => {
    setAnswers(prev => prev.map(ans =>
      ans.id === answerId
        ? { ...ans, isAccepted: true }
        : { ...ans, isAccepted: false }
    ));
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!answerContent.trim()) {
      setError('Answer cannot be empty.');
      return;
    }
    setLoading(true);
    // Mock add answer
    setTimeout(() => {
      setAnswers([
        ...answers,
        {
          id: 'a' + (answers.length + 1),
          author: user,
          content: answerContent,
          createdAt: new Date().toISOString(),
          votes: 0,
          isAccepted: false
        }
      ]);
      setAnswerContent('');
      setLoading(false);
    }, 800);
  };

  // Assume user.id === mockQuestion.author.id means user is the question owner
  const isOwner = user && user.id === mockQuestion.author.id;

  return (
    <div className="main-content">
      <div className="question-detail-container">
        <div className="card question-detail-card">
          <div className="question-header">
            <h1 className="question-title">{mockQuestion.title}</h1>
            <div className="question-meta">
              <div className="meta-item">
                <span className="meta-label">Asked by:</span>
                <span className="meta-value">{mockQuestion.author.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date:</span>
                <span className="meta-value">{new Date(mockQuestion.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="question-content">
            <div className="question-description" dangerouslySetInnerHTML={{ __html: mockQuestion.description }} />
            <div className="question-tags">
              {mockQuestion.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="answers-section">
            <h3 className="answers-title">Answers ({answers.length})</h3>
            <div className="answers-list">
              {answers.map(ans => (
                <div key={ans.id} className={`answer-card ${ans.isAccepted ? 'accepted' : ''}`}>
                  <div className="answer-header">
                    <div className="answer-author">
                      <img
                        src={ans.author.avatar || `https://ui-avatars.com/api/?name=${ans.author.name}&background=667eea&color=fff&size=32`}
                        alt={ans.author.name}
                        className="author-avatar"
                      />
                      <div className="author-info">
                        <span className="author-name">{ans.author.name}</span>
                        <span className="answer-date">{new Date(ans.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {ans.isAccepted && <span className="accepted-badge">✓ Accepted</span>}
                  </div>
                  <div className="answer-content" dangerouslySetInnerHTML={{ __html: ans.content }} />
                  <div className="question-footer" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                    <div className="vote-buttons">
                      <button
                        className="vote-btn upvote"
                        aria-label="Upvote"
                        onClick={() => handleVote(ans.id, 1)}
                        disabled={!user}
                      >▲</button>
                      <span className="vote-count">{ans.votes}</span>
                      <button
                        className="vote-btn downvote"
                        aria-label="Downvote"
                        onClick={() => handleVote(ans.id, -1)}
                        disabled={!user}
                      >▼</button>
                    </div>
                    {isOwner && !ans.isAccepted && (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleAccept(ans.id)}
                      >
                        Mark as Accepted
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {user ? (
            <div className="answer-form-section">
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
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {error}
                  </div>
                )}
                <div className="form-actions">
                  <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                    {loading ? (
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
          ) : (
            <div className="login-prompt">
              <p>Please log in to post an answer.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
