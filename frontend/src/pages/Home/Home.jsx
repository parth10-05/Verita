import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSort, FaSearch, FaFire, FaClock, FaThumbsUp, FaRocket } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { questionsAPI, apiUtils } from '../../utils/api';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Load questions from API
  const loadQuestions = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        filter,
        sort: sortBy,
        page,
        limit: 20
      };
      const search = searchParams.get('search');
      if (search) {
        params.search = search;
      }
      const response = await questionsAPI.getQuestions(params);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || page);
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
    // eslint-disable-next-line
  }, [filter, sortBy, searchParams]);

  const handleFilterChange = (newFilter) => setFilter(newFilter);
  const handleSortChange = (newSort) => setSortBy(newSort);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    loadQuestions(page);
  };

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case 'latest': return <FaClock />;
      case 'popular': return <FaFire />;
      case 'most-answered': return <FaThumbsUp />;
      default: return <FaSort />;
    }
  };

  // Animation variants (same as before, omitted for brevity)
  // ...

  if (loading) {
    return (
      <motion.div className="home-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <LoadingSkeleton type="card" count={4} />
      </motion.div>
    );
  }

  return (
    <motion.div className="home-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      {/* Hero Section */}
      <motion.div className="hero-section">
        <div className="hero-content">
          <motion.h1>Welcome to Verita</motion.h1>
          <motion.p>Ask questions, share knowledge, and learn from the community</motion.p>
          <motion.div>
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/ask" className="btn btn-primary btn-lg">
                  <FaRocket /> Ask a Question
                </Link>
              </motion.div>
            ) : (
              <div className="hero-actions">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn btn-primary btn-lg">Join the Community</Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      {/* Filters and Search */}
      <motion.div className="filters-section">
        <div className="filters-container">
          <motion.div className="filter-group" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="filter-label"><FaFilter /> Filter</label>
            <select value={filter} onChange={e => handleFilterChange(e.target.value)} className="filter-select">
              <option value="all">All Questions</option>
              <option value="unanswered">Unanswered</option>
              <option value="accepted">Accepted Answers</option>
              {user && <option value="my-questions">My Questions</option>}
            </select>
          </motion.div>
          <motion.div className="filter-group" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <label className="filter-label">{getSortIcon(sortBy)} Sort</label>
            <select value={sortBy} onChange={e => handleSortChange(e.target.value)} className="filter-select">
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="most-answered">Most Answered</option>
              <option value="most-viewed">Most Viewed</option>
            </select>
          </motion.div>
        </div>
        <AnimatePresence>
          {searchParams.get('search') && (
            <motion.div className="search-results" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <div className="search-info">
                <FaSearch />
                <span>Search results for: "{searchParams.get('search')}"</span>
                <span className="result-count">({questions.length} questions)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.div className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>{error}</motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Questions List */}
      <motion.div className="questions-section">
        <AnimatePresence mode="wait">
          {questions.length === 0 ? (
            null
          ) : (
            <div className="questions-grid">
              {questions.map((question, index) => (
                <QuestionCard key={question._id} question={question} index={index} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Home;
