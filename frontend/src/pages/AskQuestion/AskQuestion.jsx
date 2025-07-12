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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTagChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setTags(value);
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
            <p>Share your knowledge and get help from the community</p>
          </div>
          
          <form onSubmit={handleSubmit} className="ask-question-form">
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
              />
              <div className="form-hint">
                Try to be as specific as possible. Good titles help others find your question.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide all the information someone would need to answer your question. Include code examples, error messages, and any relevant context..."
              />
              <div className="form-hint">
                Use the toolbar to format your question. You can add <strong>bold text</strong>, <em>italics</em>, lists, links, and images to make your question clearer.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tags">
                Tags <span className="required">*</span>
              </label>
              <select
                id="tags"
                name="tags"
                className="form-input"
                multiple
                value={tags}
                onChange={handleTagChange}
                required
              >
                {TAG_OPTIONS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <div className="form-hint">
                Select 1-5 tags that best describe your question. Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
              </div>
              {tags.length > 0 && (
                <div className="selected-tags">
                  <span className="selected-tags-label">Selected tags:</span>
                  <div className="tags-display">
                    {tags.map(tag => (
                      <span key={tag} className="tag tag-selected">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
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
