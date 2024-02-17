// Playlist.js
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useVideoContext } from "../../context/VideoContext";
import "./playlist.css";

const Playlist = () => {
  const { videos, currentVideoIndex, setCurrentVideoIndex, onDragEnd } =
    useVideoContext();

  return (
    <>
      <hr />
      <h3 className="playlist-title">Video Playlist</h3>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="videos">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="playlist"
            >
              {videos.map((video, index) => (
                <Draggable
                  key={video.id}
                  draggableId={video.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`playlist-item ${
                        index === currentVideoIndex ? "selected" : ""
                      }`}
                      onClick={() => setCurrentVideoIndex(index)}
                    >
                      <img
                        loading="lazy"
                        src={video.thumb}
                        alt={video.title}
                        className="thumbnail"
                      />
                      <div className="video-info">
                        <h4 className="title">{video.title}</h4>
                        <p className="subtitle">{video.subtitle}</p>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default Playlist;
