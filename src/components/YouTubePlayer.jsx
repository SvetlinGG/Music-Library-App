import { useEffect, useRef, useState } from "react";
import { createPlayer, findVideo, playerErrorMessage } from "../api/youTubeApi";


export default function YouTubePlayer({ artist, album, song, onClose }) {
  const hostRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState("searching"); 
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    let player = null;

    setVideo(null);
    setError("");
    setStatus("searching");

    async function start() {
      const found = await findVideo({ artist, album, song });
      if (ignore) return;
      if (!found) throw new Error("No video found on YouTube.");
      setVideo(found);

      
      const mount = document.createElement("div");
      hostRef.current.replaceChildren(mount);

      player = await createPlayer(mount, found.videoId, {
        onError: (e) => {
          if (ignore) return;
          setError(playerErrorMessage(e.data));
          setStatus("error");
        },
      });
      if (ignore) {
        player.destroy();
        return;
      }
      setStatus("playing");
    }

    start().catch((err) => {
      if (ignore) return;
      setError(err.message);
      setStatus("error");
    });

    return () => {
      ignore = true;
      player?.destroy?.();
    };
  }, [artist, album, song]);

  const label = song ? `${song} — ${artist}` : `${album} — ${artist}`;

  return (
    <div className="yt-player">
      <div className="yt-player-head">
        <div className="yt-player-text">
          <span className="meta-label">Now playing from YouTube</span>
          <span className="yt-player-title" title={video?.title ?? label}>
            {video?.title ?? label}
          </span>
        </div>
        <button className="yt-player-close" onClick={onClose} aria-label="Close player">
          ✕
        </button>
      </div>

      {status === "searching" && <p className="catalog-subtitle">Searching YouTube…</p>}
      {status === "error" && <p className="catalog-subtitle">{error}</p>}

      <div
        ref={hostRef}
        className="yt-player-frame"
        hidden={status === "error"}
      />
    </div>
  );
}
