import React, { useState, useContext } from 'react';
import { FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
// import './VoteButtons.css';

const VoteButtons = ({ 
  votes = 0, 
  questionId, 
  answerId, 
  size = 'medium',
  onVoteChange 
}) => {
  const [voteCount, setVoteCount] = useState(votes);
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const { user } = useAuth();

  const handleVote = async (voteType) => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      alert('Please log in to vote');
      return;
    }

    let newVoteCount = voteCount;
    let newUserVote = userVote;

    if (userVote === voteType) {
      // Remove vote
      newVoteCount = voteCount - (voteType === 'up' ? 1 : -1);
      newUserVote = null;
    } else if (userVote === null) {
      // Add new vote
      newVoteCount = voteCount + (voteType === 'up' ? 1 : -1);
      newUserVote = voteType;
    } else {
      // Change vote
      newVoteCount = voteCount + (voteType === 'up' ? 2 : -2);
      newUserVote = voteType;
    }

    setVoteCount(newVoteCount);
    setUserVote(newUserVote);

    // TODO: Make API call to update vote
    // try {
    //   await api.post('/votes', {
    //     questionId,
    //     answerId,
    //     voteType: newUserVote
    //   });
    // } catch (error) {
    //   // Revert on error
    //   setVoteCount(voteCount);
    //   setUserVote(userVote);
    // }

    // Call parent callback if provided
    if (onVoteChange) {
      onVoteChange(newVoteCount, newUserVote);
    }
  };

  const formatVoteCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div className={`vote-buttons ${size}`}>
      <button
        className={`vote-btn upvote ${userVote === 'up' ? 'voted' : ''}`}
        onClick={() => handleVote('up')}
        title="Upvote"
        disabled={!user}
      >
        <FaCaretUp />
      </button>
      
      <div className="vote-count">
        {formatVoteCount(voteCount)}
      </div>
      
      <button
        className={`vote-btn downvote ${userVote === 'down' ? 'voted' : ''}`}
        onClick={() => handleVote('down')}
        title="Downvote"
        disabled={!user}
      >
        <FaCaretDown />
      </button>
    </div>
  );
};

export default VoteButtons;
