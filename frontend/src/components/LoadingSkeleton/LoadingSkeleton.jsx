import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const renderCardSkeleton = () => (
    <motion.div 
      className="skeleton-card"
      custom={0}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="skeleton-header">
        <div className="skeleton-title">
          <div className="skeleton-line" style={{ width: '70%' }} />
        </div>
        <div className="skeleton-meta">
          <div className="skeleton-line" style={{ width: '30%' }} />
          <div className="skeleton-line" style={{ width: '25%' }} />
        </div>
      </div>
      
      <div className="skeleton-body">
        <div className="skeleton-line" style={{ width: '100%' }} />
        <div className="skeleton-line" style={{ width: '90%' }} />
        <div className="skeleton-line" style={{ width: '80%' }} />
      </div>
      
      <div className="skeleton-tags">
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
      </div>
      
      <div className="skeleton-footer">
        <div className="skeleton-stats">
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
        </div>
        <div className="skeleton-author">
          <div className="skeleton-avatar" />
          <div className="skeleton-name" />
        </div>
      </div>
      
      <motion.div 
        className="skeleton-shimmer"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </motion.div>
  );

  const renderListSkeleton = () => (
    <motion.div 
      className="skeleton-list"
      custom={0}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {[...Array(5)].map((_, i) => (
        <motion.div 
          key={i}
          className="skeleton-list-item"
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="skeleton-avatar" />
          <div className="skeleton-content">
            <div className="skeleton-line" style={{ width: '60%' }} />
            <div className="skeleton-line" style={{ width: '40%' }} />
          </div>
          <motion.div 
            className="skeleton-shimmer"
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </motion.div>
      ))}
    </motion.div>
  );

  const renderTextSkeleton = () => (
    <motion.div 
      className="skeleton-text"
      custom={0}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="skeleton-line" style={{ width: '100%' }} />
      <div className="skeleton-line" style={{ width: '90%' }} />
      <div className="skeleton-line" style={{ width: '95%' }} />
      <div className="skeleton-line" style={{ width: '85%' }} />
      <div className="skeleton-line" style={{ width: '70%' }} />
      <motion.div 
        className="skeleton-shimmer"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </motion.div>
  );

  const renderComponent = () => {
    switch (type) {
      case 'card':
        return [...Array(count)].map((_, i) => (
          <div key={i}>{renderCardSkeleton()}</div>
        ));
      case 'list':
        return renderListSkeleton();
      case 'text':
        return renderTextSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <div className="loading-skeleton">
      {renderComponent()}
    </div>
  );
};

export default LoadingSkeleton; 