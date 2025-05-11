import { useStore } from "../../utils/store";
import s from "./CurrentTrack.module.scss";

const CurrentTrack = () => {
  const { currentTrackSrc, tracks } = useStore();
  
  const currentTrack = tracks.find(track => track.preview === currentTrackSrc);

  if (!currentTrack) return null;

  return (
    <div className={s.currentTrack}>
      <img 
        src={currentTrack.album.cover_xl} 
        alt="Album cover" 
        className={s.cover}
      />
      <div className={s.details}>
        <span className={s.title}>{currentTrack.title}</span>
        <span className={s.artist}>
          {currentTrack.artists.join(", ")}
        </span>
      </div>
    </div>
  );
};

export default CurrentTrack;