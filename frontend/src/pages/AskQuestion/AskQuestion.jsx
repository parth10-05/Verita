import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { questionsAPI, tagsAPI, apiUtils } from '../../utils/api';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await tagsAPI.getTags();
        setAvailableTags(response.data.tags);
      } catch (error) {
        // ignore
      } finally {
        setLoadingTags(false);
      }
    };
    loadTags();
  }, []);

  const handleTagInput = (e) => {
    setTagInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.replace(',', '').trim();
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };
  const handleTagClick = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };
  const validateForm = () => {
    if (!title.trim()) { setError('Title is required'); return false; }
    if (title.length > 120) { setError('Title must be 120 characters or less'); return false; }
    if (!description.trim()) { setError('Description is required'); return false; }
    if (tags.length === 0) { setError('At least one tag is required'); return false; }
    if (tags.length > 5) { setError('Maximum 5 tags allowed'); return false; }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) { setError('Please log in to ask a question'); return; }
    if (!validateForm()) { return; }
    setLoading(true);
    try {
      const questionData = { title: title.trim(), body: description.trim(), tags };
      const response = await questionsAPI.createQuestion(questionData);
      setSuccess('Question posted successfully! Redirecting...');
      setTimeout(() => { navigate(`/question/${response.data.question._id}`); }, 1000);
    } catch (error) {
      setError(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };
  if (!user) {
    return (
      <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="auth-required"><h2>Authentication Required</h2><p>Please log in to ask a question.</p></div>
      </motion.div>
    );
  }
  return (
    <motion.div className="main-content" initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }}>
      <motion.div className="ask-question-container">
        <motion.div className="card ask-question-card" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <motion.div className="ask-question-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <h2>Ask a Question</h2>
            <p>Share your knowledge and get help from the community. Please provide as much detail as possible!</p>
          </motion.div>
          <motion.form onSubmit={handleSubmit} className="ask-question-form" autoComplete="off" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <AnimatePresence>
              {error && <motion.div className="error-message" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.3 }}>{error}</motion.div>}
              {success && <motion.div className="success-message" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.3 }}>{success}</motion.div>}
            </AnimatePresence>
            <motion.div className="form-group">
              <label className="form-label" htmlFor="title">Title <span className="required">*</span></label>
              <motion.input className="form-input" type="text" id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="What's your question? Be specific." required maxLength={120} aria-describedby="title-hint" whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }} />
              <div className="form-hint" id="title-hint">A good title summarizes your question in a single sentence (max 120 characters).<span className="char-count">{title.length}/120</span></div>
            </motion.div>
            <motion.div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Describe your problem in detail. Include code, error messages, and what you have tried. Use the toolbar for formatting." />
              <div className="form-hint">Use the toolbar to format your question: <strong>bold</strong>, <em>italics</em>, lists, links, images, emoji, and more.</div>
            </motion.div>
            <motion.div className="form-group">
              <label className="form-label" htmlFor="tags"><FaTag /> Tags <span className="required">*</span></label>
              <motion.input className="form-input" id="tags" name="tags" type="text" value={tagInput} onChange={handleTagInput} placeholder="Type a tag and press comma, or select below (max 5)" aria-describedby="tags-hint" autoComplete="off" whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }} />
              <motion.div className="tags-display" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {tags.map((tag, index) => (
                  <motion.span key={tag} className="tag tag-selected" style={{ marginRight: 8 }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                    {tag}
                    <motion.button type="button" aria-label={`Remove tag ${tag}`} onClick={() => handleRemoveTag(tag)} style={{ marginLeft: 4, background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontWeight: 'bold' }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}><FaTimes /></motion.button>
                  </motion.span>
                ))}
              </motion.div>
              <div className="form-hint" id="tags-hint">Select or type 1-5 tags that best describe your question. Popular tags:</div>
              <motion.div className="tags-display" style={{ marginTop: 4, flexWrap: 'wrap' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {loadingTags ? (
                  <motion.div className="loading-tags" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><FaSpinner /></motion.div>
                ) : (
                  availableTags.filter(tag => !tags.includes(tag.name)).slice(0, 20).map((tag, index) => (
                    <motion.span key={tag._id} className="tag" style={{ cursor: 'pointer', marginRight: 8, marginBottom: 4 }} onClick={() => handleTagClick(tag.name)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + index * 0.02 }}>{tag.name}</motion.span>
                  ))
                )}
              </motion.div>
            </motion.div>
            <motion.div className="form-actions">
              <motion.button className="btn btn-primary btn-lg" type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <AnimatePresence mode="wait">{loading ? (<motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="loading-spinner" />) : (<motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>Post Question</motion.span>)}</AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AskQuestion;
