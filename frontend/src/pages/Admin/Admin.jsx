import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaQuestion, FaComment, FaBan, FaUnlock, FaTrash, FaSearch, FaChartBar, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, apiUtils } from '../../utils/api';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Check if user is admin - no redirect, just show access denied
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadStats();
      setLoading(false);
    } else if (user && user.role !== 'admin') {
      setLoading(false);
    }
  }, [user]);

  // Debug section - remove this after fixing the issue
  const DebugInfo = () => {
    if (!user) return null;
    
    return (
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <h4>Debug Info:</h4>
        <p><strong>User ID:</strong> {user._id || user.id}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role || 'undefined'}</p>
        <p><strong>Full user object:</strong> {JSON.stringify(user, null, 2)}</p>
      </div>
    );
  };

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Load users
  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery || undefined
      };
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // Load questions
  const loadQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        search: searchQuery || undefined
      };
      const response = await adminAPI.getAllQuestions(params);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setError(null);
    
    if (tab === 'dashboard') {
      loadStats();
    } else if (tab === 'users') {
      loadUsers(1);
    } else if (tab === 'questions') {
      loadQuestions(1);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'users') {
      loadUsers(1);
    } else if (activeTab === 'questions') {
      loadQuestions(1);
    }
  };

  // Handle ban/unban user
  const handleToggleBan = async (userId, isBanned) => {
    try {
      await adminAPI.toggleUserBan(userId, isBanned);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, is_banned: isBanned } : user
      ));
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deleteQuestion(questionId);
      setQuestions(questions.filter(question => question._id !== questionId));
    } catch (error) {
      setError(apiUtils.handleError(error));
    }
  };

  if (!user) {
    return (
      <div className="admin-container">
        <div className="error-message">Please log in to access this page.</div>
      </div>
    );
  }

  // Debug: Log user data to console
  console.log('User data:', user);
  console.log('User role:', user.role);

  if (user.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="error-message">
          Access denied. Admin privileges required. 
          <br />
          Current role: {user.role || 'undefined'}
        </div>
      </div>
    );
  }

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="admin-container">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <motion.div className="admin-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <DebugInfo />
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, questions, and monitor platform activity</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          <FaUsers /> Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => handleTabChange('questions')}
        >
          <FaQuestion /> Questions
        </button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <motion.div className="dashboard-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaUsers /></div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
                <small>+{stats.newUsers} this week</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaQuestion /></div>
              <div className="stat-content">
                <h3>{stats.totalQuestions}</h3>
                <p>Total Questions</p>
                <small>+{stats.newQuestions} this week</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FaComment /></div>
              <div className="stat-content">
                <h3>{stats.totalAnswers}</h3>
                <p>Total Answers</p>
                <small>+{stats.newAnswers} this week</small>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div className="users-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Search */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Users List */}
          {loading ? (
            <LoadingSkeleton type="card" count={5} />
          ) : (
            <div className="users-list">
              {users.map(user => (
                <motion.div key={user._id} className="user-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="user-info">
                    <div className="user-avatar">
                      <FaUserShield />
                    </div>
                    <div className="user-details">
                      <h4>{user.username}</h4>
                      <p>{user.email}</p>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                      {user.is_banned && <span className="banned-badge">Banned</span>}
                    </div>
                  </div>
                  <div className="user-actions">
                    {!user.is_banned ? (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleToggleBan(user._id, true)}
                        disabled={user.role === 'admin'}
                      >
                        <FaBan /> Ban
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleToggleBan(user._id, false)}
                      >
                        <FaUnlock /> Unban
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user._id)}
                      disabled={user.role === 'admin'}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn" 
                onClick={() => loadUsers(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                className="btn" 
                onClick={() => loadUsers(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <motion.div className="questions-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Search */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Questions List */}
          {loading ? (
            <LoadingSkeleton type="card" count={5} />
          ) : (
            <div className="questions-list">
              {questions.map(question => (
                <motion.div key={question._id} className="question-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="question-info">
                    <h4>{question.title}</h4>
                    <p>By: {question.authorId?.username || 'Unknown'}</p>
                    <p>Created: {new Date(question.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="question-actions">
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteQuestion(question._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="btn" 
                onClick={() => loadQuestions(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                className="btn" 
                onClick={() => loadQuestions(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Admin; 