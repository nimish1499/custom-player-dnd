import React, { useState, useEffect, useRef } from "react";
import { useVideoContext } from "../../context/VideoContext";

import "./videoplayer.css";

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const wasPlayingBeforeScrubRef = useRef(false);

  const { videos, currentVideoIndex, setCurrentVideoIndex } = useVideoContext();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      const nextVideoIndex = currentVideoIndex + 1;
      if (nextVideoIndex < videos.length) {
        // Move to the next video if it's not the last one
        setCurrentVideoIndex(nextVideoIndex);
      }
    };
    setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    videoElement.addEventListener("ended", handleVideoEnd);
    videoElement.addEventListener("canplay", handleCanPlay);

    // Play the video when the currentVideoIndex changes
    videoElement.load();
    videoElement.play();

    return () => {
      videoElement.removeEventListener("ended", handleVideoEnd);
      videoRef.current.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentVideoIndex, videos?.length, setCurrentVideoIndex]);

  // Load video metadata
  useEffect(() => {
    setDuration(videoRef.current.duration);
  }, [videoRef.current?.duration]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoRef.current]);

  // Handlers for video controls
  const togglePlay = () => {
    if (isPlaying) {
      videoRef?.current?.pause();
    } else {
      videoRef?.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRef.current.muted = !videoRef.current.muted;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    // setIsMuted(newVolume === 0);
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };

  const toggleFullScreenMode = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePlaybackSpeed = () => {
    const newPlaybackRate = playbackRate >= 2 ? 0.5 : playbackRate + 0.25;
    setPlaybackRate(newPlaybackRate);
    videoRef.current.playbackRate = newPlaybackRate;
  };

  const skip = (time) => {
    videoRef.current.currentTime += time;
  };

  // Format time to display
  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return [hours, minutes, seconds]
      .map((val) => (val < 10 ? `0${val}` : val))
      .filter((val, index) => val !== "00" || index > 0)
      .join(":");
  };

  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubTimeRef = useRef(0); // To temporarily store the scrub time during scrubbing

  // Keydown event for shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullScreenMode();
          break;
        case "t":
          toggleTheaterMode();
          break;
        case "i":
          toggleMiniPlayerMode();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          skip(-5);
          break;
        case "arrowright":
        case "l":
          skip(5);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseDown = (e) => {
    // Use a ref to store whether the video was playing before scrubbing started
    wasPlayingBeforeScrubRef.current = isPlaying;
    setIsScrubbing(true);
    // Immediately seek to the scrub position
    handleScrub(e);
  };

  const handleMouseUp = () => {
    if (!isScrubbing) return;
    setIsScrubbing(false);
    videoRef.current.currentTime = scrubTimeRef.current;
    // Resume playing if the video was playing before scrubbing started
    if (wasPlayingBeforeScrubRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseMove = (e) => {
    if (isScrubbing) {
      handleScrub(e);
    }
  };

  const handleScrub = (e) => {
    const timelineRect = e.target.getBoundingClientRect();
    const scrubPosition = (e.clientX - timelineRect.left) / timelineRect.width;
    const scrubTime = scrubPosition * videoRef?.current?.duration;
    scrubTimeRef.current = scrubTime;
    // Update the video current time only if scrubbing
    if (isScrubbing) {
      videoRef.current.currentTime = scrubTime;
    }
  };
  useEffect(() => {
    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
        if (wasPlayingBeforeScrubRef.current && videoRef.current) {
          videoRef.current.play();
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [isScrubbing]);

  return (
    <div>
      <div
        className={`video-container ${isPlaying ? "" : "paused"} ${
          isLoading ? "loading" : ""
        } ${isFullscreen ? "full-screen" : ""}`}
        data-volume-level={isMuted ? "muted" : volume > 0.5 ? "high" : "low"}
      >
        <img
          className="thumbnail-img"
          style={{ display: isPlaying ? "none" : "block" }}
          alt=""
          src={videos?.[currentVideoIndex]?.thumb}
          loading="lazy"
        />
        <div className="video-controls-container">
          <div
            className="timeline-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp} // Consider stopping scrubbing when the mouse leaves the container
            onMouseUp={handleMouseUp}
          >
            <div className="timeline">
              <div
                className="progress-bar"
                style={{
                  width: `${(videoRef.current?.currentTime / duration) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="controls">
            <button className="play-pause-btn" onClick={togglePlay}>
              {isPlaying ? (
                <svg className="pause-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M14,19H18V5H14M6,19H10V5H6V19Z"
                  />
                </svg>
              ) : (
                <svg className="play-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                  />
                </svg>
              )}
            </button>
            <div className="volume-container">
              <button className="mute-btn" onClick={toggleMute}>
                {!isMuted ? (
                  <>
                    {" "}
                    <svg class="volume-high-icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
                      />
                    </svg>
                    <svg class="volume-low-icon" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z"
                      />
                    </svg>
                  </>
                ) : (
                  <svg class="volume-muted-icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
                    />
                  </svg>
                )}
              </button>
              <input
                className="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
              />
            </div>
            <div className="duration-container">
              <div className="current-time">{formatTime(currentTime)}</div> /{" "}
              <div className="total-time">{formatTime(duration) ?? ""}</div>
            </div>
            <button
              className="speed-btn wide-btn"
              onClick={handlePlaybackSpeed}
            >
              {playbackRate}x
            </button>

            <button className="full-screen-btn" onClick={toggleFullScreenMode}>
              {/* Fullscreen SVGs */}
              <svg class="open" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
              <svg class="close" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                />
              </svg>
            </button>
          </div>
        </div>
        <video
          ref={videoRef}
          src={videos?.[currentVideoIndex]?.sources?.[0]}
          onLoadedMetadata={() =>
            setDuration(videoRef?.current?.duration ?? "")
          }
          autoPlay
          muted
        >
          <track kind="captions" srclang="en" src="assets/subtitles.vtt" />
        </video>
      </div>
      <div className="videoplayer-info">
        <h1 className="videoplayer-title">
          {videos?.[currentVideoIndex]?.title ?? ""}
        </h1>
        <p className="videoplayer-description">
          {videos?.[currentVideoIndex]?.description ?? ""}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
