import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaComment, FaCheck, FaClock, FaUser } from 'react-icons/fa';
import VoteButtons from '../VoteButtons/VoteButtons';

const QuestionCard = ({ question, index = 0 }) => {
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
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: index * 0.1, ease: "easeOut" } },
    hover: { y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }
  };
  // Handle API data structure
  const questionData = {
    id: question._id || question.id,
    title: question.title,
    description: question.body || question.description || question.content,
    author: {
      name: question.authorId?.username || question.author?.name || question.authorName || 'Unknown User',
      avatar: question.authorId?.profile_photo || question.author?.avatar || question.authorAvatar
    },
    tags: question.tagIds?.map(tag => tag.name) || question.tags || [],
    votes: question.upvotes - question.downvotes || question.votes || 0,
    answers: question.answerCount || question.answers || 0,
    views: question.viewCount || question.views || 0,
    createdAt: question.createdAt,
    isAccepted: question.hasAcceptedAnswer || question.isAccepted || false
  };
  return (
    <motion.div className="question-card card" variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" layout>
      <div className="question-header">
        <div className="question-title">
          <Link to={`/question/${questionData.id}`} className="title-link">{questionData.title}</Link>
          {questionData.isAccepted && (
            <span className="accepted-badge" title="Has accepted answer"><FaCheck /></span>
          )}
        </div>
        <div className="question-meta">
          <div className="meta-item"><FaClock /><span>{formatTimeAgo(questionData.createdAt)}</span></div>
          <div className="meta-item"><FaUser /><span>{questionData.author.name}</span></div>
        </div>
      </div>
      <div className="question-body">
        <p className="question-description">{truncateText(questionData.description)}</p>
        <div className="question-tags">
          {questionData.tags.map((tag, tagIndex) => (
            <Link key={tagIndex} to={`/?search=${encodeURIComponent(tag)}`} className="tag">{tag}</Link>
          ))}
        </div>
      </div>
      <div className="question-footer">
        <div className="question-stats">
          <div className="stat-item">
            <VoteButtons votes={questionData.votes} questionId={questionData.id} size="small" />
          </div>
          <div className="stat-item"><FaComment />
            {questionData.answers === 0 ? (
              <span>No answers yet</span>
            ) : (
              <span>{questionData.answers} answers</span>
            )}
          </div>
        </div>
        <div className="question-author">
          <div className="author-avatar">
            <img src={questionData.author.avatar || `https://ui-avatars.com/api/?name=${questionData.author.name}&background=667eea&color=fff&size=32`} alt={questionData.author.name} />
          </div>
          <div className="author-info"><span className="author-name">{questionData.author.name}</span></div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionCard;
