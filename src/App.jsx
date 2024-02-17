import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";
import Playlist from "./components/PlayList/Playlist";
import { VideoProvider } from "./context/VideoContext";

function App() {
  return (
    <VideoProvider>
      <div className={"media-container"}>
        <div className = "videoPlayer-container">
          <VideoPlayer />
        </div>
        <div className="playList-container">
          <Playlist />
        </div>
      </div>
    </VideoProvider>
  );
}

export default App;
