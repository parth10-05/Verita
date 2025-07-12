import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, apiUtils } from '../../utils/api';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';

const Profile = () => {
  const { user, logout } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('questions');

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar URL with initials
  const getAvatarUrl = (name) => {
    const initials = getInitials(name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=64&bold=true&font-size=0.4`;
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [questionsRes, answersRes, statsRes] = await Promise.all([
          userAPI.getUserQuestions(user._id || user.id),
          userAPI.getUserAnswers(user._id || user.id),
          userAPI.getUserStats(user._id || user.id)
        ]);

        setQuestions(questionsRes.data.questions || []);
        setAnswers(answersRes.data.answers || []);
        setStats(statsRes.data.stats);
      } catch (error) {
        setError(apiUtils.handleError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="main-content text-center" style={{ marginTop: '3rem' }}>
        <div className="card" style={{ padding: '2rem', maxWidth: 400, margin: '0 auto' }}>
          <h2>Please log in to view your profile.</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="main-content" style={{ maxWidth: 700, margin: '0 auto' }}>
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        {/* User Info Section */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={getAvatarUrl(user.username || user.name)}
            alt={user.username || user.name}
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              border: '3px solid var(--primary-color)',
              objectFit: 'cover'
            }}
          />
          <div>
            <h2 style={{ marginBottom: 8, fontSize: '1.8rem' }}>
              {user.username || user.name}
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 8 }}>
              {user.email}
            </div>
            {stats && (
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                <span>{stats.questionCount || 0} Questions</span>
                <span>{stats.answerCount || 0} Answers</span>
                <span>{stats.acceptedAnswerCount || 0} Accepted</span>
              </div>
            )}
          </div>
        </div>

        <button 
          className="btn btn-outline mb-6" 
          onClick={logout}
          style={{ marginBottom: '2rem' }}
        >
          Logout
        </button>

        {/* Error Display */}
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'questions' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'questions' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            Questions ({questions.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'answers' ? 'active' : ''}`}
            onClick={() => setActiveTab('answers')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'answers' ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === 'answers' ? 'var(--primary-color)' : 'var(--text-secondary)'
            }}
          >
            Answers ({answers.length})
          </button>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div>
            <h3 className="mb-4">Your Questions</h3>
            {questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                You haven't asked any questions yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {questions.map(question => (
                  <li 
                    key={question._id} 
                    className="card mb-3" 
                    style={{ 
                      padding: '1rem', 
                      borderLeft: '4px solid var(--primary-color)',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {question.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {question.upvotes || 0} votes • {question.answerCount || 0} answers • {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Answers Tab */}
        {activeTab === 'answers' && (
          <div>
            <h3 className="mb-4">Your Answers</h3>
            {answers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                You haven't answered any questions yet.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {answers.map(answer => (
                  <li 
                    key={answer._id} 
                    className="card mb-3" 
                    style={{ 
                      padding: '1rem', 
                      borderLeft: answer.is_accepted ? '4px solid var(--success-color)' : '4px solid var(--primary-color)',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {answer.question_id?.title || 'Question title not available'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {answer.content.length > 100 ? `${answer.content.substring(0, 100)}...` : answer.content}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {answer.upvotes || 0} votes • {answer.is_accepted ? 'Accepted' : 'Not accepted'} • {new Date(answer.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
