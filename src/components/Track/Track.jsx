import audioController from "../../utils/AudioController";
import scene from "../../webgl/Scene";
import { useStore } from "../../utils/store";
import s from "./Track.module.scss";

const Track = ({ title, cover, src, duration, artists, index, id }) => {
  const { currentTrackSrc, setCurrentTrackSrc, favorites, setFavorites } = useStore();

  const isActive = currentTrackSrc === src;
  const isFavorite = favorites.includes(id);

   const toggleFavorite = (e) => {
    e.stopPropagation();
    const newFavorites = isFavorite 
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
  };

  const getSeconds = () => {
    const minutes = Math.floor(duration / 60);
    let seconds = Math.round(duration - minutes * 60);

    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
  };

  const onClick = () => {
  if (!audioController.audio || !audioController.ctx) {
    audioController.setup();
  }
  
  if (audioController.ctx?.state === 'suspended') {
    audioController.ctx.resume();
  }

  if (currentTrackSrc === src) {
    audioController.togglePlayback();
  } else {
    audioController.play(src);
    scene.cover.setCover(cover);
    setCurrentTrackSrc(src);
  }
};

  return (
    <div
      className={`${s.track} ${currentTrackSrc === src ? s.active : ''}`}
      onClick={onClick}
      data-active={isActive}
    >
      <span className={s.order}>{index + 1}</span>
      <div className={s.title}>
        <button onClick={toggleFavorite} className={`${s.favoriteButton} ${isFavorite ? s.favorited : ''}`}>
          ♥
        </button>
        <img src={cover} alt="" className={s.cover} />
        <div className={s.details}>
          <span className={s.trackName}>{title}</span>
          {artists.map((artist, i) => (
            <span key={artist + i} className={s.artistName}>
              {artist}
            </span>
          ))}
        </div>
      </div>
      <span className={s.duration}>{getSeconds()}</span>
    </div>
  );
};

export default Track;
