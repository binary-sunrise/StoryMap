import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardVariants, textVariants } from '../utils/animations';

const StoryCard = ({ story, isActive }) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className="story-card-container"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={story.style}
        >
          <motion.h2
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            {story.title}
          </motion.h2>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {story.description}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StoryCard;