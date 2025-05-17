
import React from 'react';

const StoryCard = ({ story }) => {
  return (
    <div className="story-card-container" style={story.style}>
      <h2>{story.title}</h2>
      <p>{story.description}</p>
    </div>
  );
};

export default StoryCard;