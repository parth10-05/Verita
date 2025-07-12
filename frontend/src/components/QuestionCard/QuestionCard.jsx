import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaComment, FaCheck, FaClock, FaUser } from 'react-icons/fa';
import VoteButtons from '../VoteButtons/VoteButtons';
// import './QuestionCard.css';

const QuestionCard = ({ question }) => {
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

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="question-card card">
      <div className="question-header">
        <div className="question-title">
          <Link to={`/question/${question.id}`} className="title-link">
            {question.title}
          </Link>
          {question.isAccepted && (
            <span className="accepted-badge" title="Has accepted answer">
              <FaCheck />
            </span>
          )}
        </div>
        
        <div className="question-meta">
          <div className="meta-item">
            <FaClock />
            <span>{formatTimeAgo(question.createdAt)}</span>
          </div>
          <div className="meta-item">
            <FaUser />
            <span>{question.author.name}</span>
          </div>
        </div>
      </div>

      <div className="question-body">
        <p className="question-description">
          {truncateText(question.description)}
        </p>
        
        <div className="question-tags">
          {question.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/?search=${encodeURIComponent(tag)}`}
              className="tag"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <div className="question-footer">
        <div className="question-stats">
          <div className="stat-item">
            <VoteButtons 
              votes={question.votes}
              questionId={question.id}
              size="small"
            />
          </div>
          
          <div className="stat-item">
            <FaComment />
            <span>{question.answers} answers</span>
          </div>
          
          <div className="stat-item">
            <FaEye />
            <span>{question.views} views</span>
          </div>
        </div>

        <div className="question-author">
          <div className="author-avatar">
            <img
              src={question.author.avatar || `https://ui-avatars.com/api/?name=${question.author.name}&background=667eea&color=fff&size=32`}
              alt={question.author.name}
            />
          </div>
          <div className="author-info">
            <span className="author-name">{question.author.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
