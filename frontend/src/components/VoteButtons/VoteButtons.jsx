import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { votesAPI, apiUtils } from '../../utils/api';

const VoteButtons = ({ 
  votes = 0, 
  questionId, 
  answerId, 
  size = 'medium',
  onVoteChange 
}) => {
  const [voteCount, setVoteCount] = useState(votes);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load user's existing vote
  useEffect(() => {
    const loadUserVote = async () => {
      if (!user || (!questionId && !answerId)) return;
      try {
        let response;
        if (questionId) {
          response = await votesAPI.getQuestionVote(questionId);
        } else if (answerId) {
          response = await votesAPI.getAnswerVote(answerId);
        }
        if (response?.data?.voteType) {
          setUserVote(response.data.voteType);
        }
      } catch (error) {}
    };
    loadUserVote();
  }, [user, questionId, answerId]);

  // Update vote count when votes prop changes
  useEffect(() => {
    setVoteCount(votes);
  }, [votes]);

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      let response;
      if (questionId) {
        response = await votesAPI.voteQuestion(questionId, voteType);
      } else if (answerId) {
        response = await votesAPI.voteAnswer(answerId, voteType);
      }
      const { newVoteCount, newUserVote } = response.data;
      setVoteCount(newVoteCount);
      setUserVote(newUserVote);
      if (onVoteChange) {
        onVoteChange(newVoteCount, newUserVote);
      }
    } catch (error) {
      alert(apiUtils.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatVoteCount = (count) => {
    if (typeof count !== 'number' || isNaN(count)) return '0';
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <motion.div className={`vote-buttons ${size}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <motion.button
        className={`vote-btn upvote ${userVote === 'up' ? 'voted' : ''}`}
        onClick={() => handleVote('upvote')}
        title="Upvote"
        disabled={!user || loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <FaCaretUp />
      </motion.button>
      <motion.div className="vote-count" key={voteCount}>{formatVoteCount(voteCount)}</motion.div>
      <motion.button
        className={`vote-btn downvote ${userVote === 'down' ? 'voted' : ''}`}
        onClick={() => handleVote('downvote')}
        title="Downvote"
        disabled={!user || loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <FaCaretDown />
      </motion.button>
    </motion.div>
  );
};

export default VoteButtons;
