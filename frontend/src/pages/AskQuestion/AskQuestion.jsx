import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';

const TAG_OPTIONS = [
  'React', 'JWT', 'Node.js', 'MongoDB', 'CSS', 'JavaScript', 'Frontend', 'Backend', 'API', 'Database', 'Authentication', 'Authorization', 'Redux', 'Hooks', 'Express', 'UI', 'UX'
];

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add tag from input
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

  // Add tag from option click
  const handleTagClick = (tag) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  // Remove tag
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim() || tags.length === 0) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    // TODO: Submit to backend
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="main-content">
      <div className="ask-question-container">
        <div className="card ask-question-card">
          <div className="ask-question-header">
            <h2>Ask a Question</h2>
            <p>Share your knowledge and get help from the community. Please provide as much detail as possible!</p>
          </div>
          <form onSubmit={handleSubmit} className="ask-question-form" autoComplete="off">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's your question? Be specific."
                required
                maxLength={120}
                aria-describedby="title-hint"
              />
              <div className="form-hint" id="title-hint">
                A good title summarizes your question in a single sentence (max 120 characters).
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your problem in detail. Include code, error messages, and what you have tried. Use the toolbar for formatting."
              />
              <div className="form-hint">
                Use the toolbar to format your question: <strong>bold</strong>, <em>italics</em>, lists, links, images, emoji, and more.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">
                Tags <span className="required">*</span>
              </label>
              <input
                className="form-input"
                id="tags"
                name="tags"
                type="text"
                value={tagInput}
                onChange={handleTagInput}
                placeholder="Type a tag and press comma, or select below (max 5)"
                aria-describedby="tags-hint"
                autoComplete="off"
              />
              <div className="tags-display" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                {tags.map(tag => (
                  <span key={tag} className="tag tag-selected" style={{ marginRight: 8 }}>
                    {tag}
                    <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => handleRemoveTag(tag)} style={{ marginLeft: 4, background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
              <div className="form-hint" id="tags-hint">
                Select or type 1-5 tags that best describe your question. Popular tags:
              </div>
              <div className="tags-display" style={{ marginTop: 4, flexWrap: 'wrap' }}>
                {TAG_OPTIONS.filter(tag => !tags.includes(tag)).map(tag => (
                  <span key={tag} className="tag" style={{ cursor: 'pointer', marginRight: 8, marginBottom: 4 }} onClick={() => handleTagClick(tag)}>{tag}</span>
                ))}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button 
                className="btn btn-primary btn-lg" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Posting Question...
                  </>
                ) : (
                  'Post Question'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
