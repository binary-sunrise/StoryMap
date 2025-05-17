// pages/index.js
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import StoryCard from "../components/StoryCard";
import stories from "../data/stories.json";

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import("../components/Map"), {
  ssr: false, // Disable server-side rendering
  loading: () => <p>Loading map...</p>, // Fallback UI while loading
});

// Custom hook for handling scroll events
const useScrollHandler = (storiesLength, activeStoryIndex, setActiveStoryIndex) => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const storyHeight = window.innerHeight;
      const newIndex = Math.floor(scrollPosition / storyHeight);

      if (newIndex !== activeStoryIndex && newIndex < storiesLength) {
        setActiveStoryIndex(newIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storiesLength, activeStoryIndex, setActiveStoryIndex]); // Add activeStoryIndex to dependencies
};

export default function Home() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  useScrollHandler(stories.length, activeStoryIndex, setActiveStoryIndex);

  const activeStory = stories[activeStoryIndex] || {};

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* Fixed Map Container */}
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <MapComponent story={activeStory} />
      </div>



      {/* Scrollable Stories Container */}
      <div className="relative z-10 w-full h-screen">
        {stories.map((story, index) => (
          <div
            key={story.id}
            className={`story-section ${index === activeStoryIndex ? "active" : ""}`}
            style={{ height: "100vh", padding: "20px" }}
          >
            <StoryCard story={activeStory} />
          </div>
        ))}
      </div>
    </div>
  );
}