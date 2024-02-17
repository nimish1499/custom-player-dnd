// VideoContext.js
import React, { createContext, useState, useContext } from "react";
import { mediaJSON } from "../utils/data"; // Adjust the import path as needed

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [videos, setVideos] = useState(mediaJSON.categories[0].videos);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVideos(items);
    // Optionally, adjust currentVideoIndex based on the drag result
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        setVideos,
        currentVideoIndex,
        setCurrentVideoIndex,
        onDragEnd,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => useContext(VideoContext);
