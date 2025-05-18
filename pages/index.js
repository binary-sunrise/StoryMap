// pages/index.js
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring } from "framer-motion";
import { useInView } from "react-intersection-observer";
import StoryCard from "../components/StoryCard";
import stories from "../public/data/stories.json"; // Import stories data

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false, // Disable server-side rendering
  loading: () => <p>Loading map...</p>, // Fallback UI while loading
});

// Custom hook for handling scroll events
const useScrollHandler = (storiesLength, setActiveStoryIndex) => {
  const observers = stories.map((_, index) => {
    const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: false,
    });
    return { ref, inView, index };
  });

  useEffect(() => {
    const activeObserver = observers.find((obs) => obs.inView);
    if (activeObserver) {
      setActiveStoryIndex(activeObserver.index);
    }
  }, [observers.map((obs) => obs.inView)]);

  return observers;
};

export default function Home() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const observers = useScrollHandler(stories.length, setActiveStoryIndex);
  const activeStory = stories[activeStoryIndex] || {};

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Fixed Map Container */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <MapComponent story={activeStory} />
      </div>

      {/* Scrollable Stories Container */}
      <div className="relative z-10">
        {stories.map((story, index) => {
          const observer = observers[index];
          return (
            <div
              key={story.id}
              ref={observer.ref}
              className="story-section min-h-screen flex items-center"
            >
              <StoryCard story={story} isActive={index === activeStoryIndex} />
            </div>
          );
        })}
      </div>
    </div>
  );
}