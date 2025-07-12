import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaFilter, FaSort, FaSearch, FaFire, FaClock, FaThumbsUp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
// import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Mock data for demonstration
  const mockQuestions = [
    {
      id: '1',
      title: 'How to implement authentication in React with JWT?',
      description: 'I\'m building a React application and need to implement user authentication using JWT tokens. What\'s the best approach?',
      author: {
        id: '1',
        name: 'John Doe',
        avatar: null
      },
      tags: ['React', 'JWT', 'Authentication'],
      votes: 15,
      answers: 3,
      views: 120,
      createdAt: '2024-01-15T10:30:00Z',
      isAccepted: false
    },
    {
      id: '2',
      title: 'Best practices for state management in large React applications',
      description: 'I\'m working on a large React application and struggling with state management. Should I use Redux, Context API, or something else?',
      author: {
        id: '2',
        name: 'Jane Smith',
        avatar: null
      },
      tags: ['React', 'Redux', 'State Management'],
      votes: 28,
      answers: 7,
      views: 450,
      createdAt: '2024-01-14T15:45:00Z',
      isAccepted: true
    },
    {
      id: '3',
      title: 'How to optimize MongoDB queries for better performance?',
      description: 'My MongoDB queries are running slowly. What are some optimization techniques I can use to improve performance?',
      author: {
        id: '3',
        name: 'Mike Johnson',
        avatar: null
      },
      tags: ['MongoDB', 'Performance', 'Database'],
      votes: 12,
      answers: 2,
      views: 89,
      createdAt: '2024-01-13T09:20:00Z',
      isAccepted: false
    },
    {
      id: '4',
      title: 'Setting up WebSocket connections in Node.js',
      description: 'I need to implement real-time communication in my Node.js application. How do I set up WebSocket connections?',
      author: {
        id: '4',
        name: 'Sarah Wilson',
        avatar: null
      },
      tags: ['Node.js', 'WebSocket', 'Real-time'],
      votes: 8,
      answers: 1,
      views: 67,
      createdAt: '2024-01-12T14:15:00Z',
      isAccepted: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Handle search from URL params
    const search = searchParams.get('search');
    if (search) {
      // Filter questions based on search
      const filtered = mockQuestions.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
      setQuestions(filtered);
    } else {
      setQuestions(mockQuestions);
    }
  }, [searchParams]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    let filtered = [...mockQuestions];
    
    switch (newFilter) {
      case 'unanswered':
        filtered = filtered.filter(q => q.answers === 0);
        break;
      case 'accepted':
        filtered = filtered.filter(q => q.isAccepted);
        break;
      case 'my-questions':
        if (user) {
          filtered = filtered.filter(q => q.author.id === user.id);
        }
        break;
      default:
        break;
    }
    
    setQuestions(filtered);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    let sorted = [...questions];
    
    switch (newSort) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        sorted.sort((a, b) => b.votes - a.votes);
        break;
      case 'most-answered':
        sorted.sort((a, b) => b.answers - a.answers);
        break;
      case 'most-viewed':
        sorted.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }
    
    setQuestions(sorted);
  };

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case 'latest':
        return <FaClock />;
      case 'popular':
        return <FaFire />;
      case 'most-answered':
        return <FaThumbsUp />;
      default:
        return <FaSort />;
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Verita</h1>
          <p>Ask questions, share knowledge, and learn from the community</p>
          {user ? (
            <Link to="/ask" className="btn btn-primary btn-lg">
              Ask a Question
            </Link>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join the Community
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">
              <FaFilter /> Filter
            </label>
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Questions</option>
              <option value="unanswered">Unanswered</option>
              <option value="accepted">Accepted Answers</option>
              {user && <option value="my-questions">My Questions</option>}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              {getSortIcon(sortBy)} Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="most-answered">Most Answered</option>
              <option value="most-viewed">Most Viewed</option>
            </select>
          </div>
        </div>

        <div className="search-results">
          {searchParams.get('search') && (
            <div className="search-info">
              <FaSearch />
              <span>Search results for: "{searchParams.get('search')}"</span>
              <span className="result-count">({questions.length} questions)</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="questions-section">
        {questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❓</div>
            <h3>No questions found</h3>
            <p>
              {searchParams.get('search') 
                ? `No questions match your search for "${searchParams.get('search')}"`
                : 'Be the first to ask a question!'
              }
            </p>
            {user && (
              <Link to="/ask" className="btn btn-primary">
                Ask a Question
              </Link>
            )}
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">{mockQuestions.length}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {mockQuestions.reduce((sum, q) => sum + q.answers, 0)}
            </div>
            <div className="stat-label">Answers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {mockQuestions.reduce((sum, q) => sum + q.votes, 0)}
            </div>
            <div className="stat-label">Votes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
