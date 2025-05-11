import s from "./Controls.module.scss";
import { useStore } from "../../utils/store";
import AudioController from "../../utils/AudioController";
import { icons } from "../../utils/icons";

const Controls = () => {
  const isMuted = useStore(state => state.isMuted);
  const isShuffle = useStore(state => state.isShuffle);
  const setIsMuted = useStore(state => state.setIsMuted);
  const setIsShuffle = useStore(state => state.setIsShuffle);
  const { queue, clearQueue } = useStore();

  return (
    <div className={s.controls}>
      <button 
        className={`${s.navButton} ${isShuffle ? s.active : ''}`}
        onClick={() => setIsShuffle(!isShuffle)}
        title={isShuffle ? "Disable shuffle" : "Enable shuffle"}
      >
        {isShuffle ? <icons.shuffleOn /> : <icons.shuffleOff />}
      </button>
      
      <button 
        className={s.navButton} 
        onClick={() => AudioController.previousTrack()}
        title="Previous track"
      >
        <icons.previous />
      </button>
      
      <PlayButton />

      <button 
        className={s.navButton} 
        onClick={() => AudioController.nextTrack()}
        title="Next track"
      >
        <icons.next />
      </button>
      
      <button 
        className={`${s.navButton} ${!isMuted ? s.active : ''}`}
        onClick={() => {
          AudioController.toggleMute();
          setIsMuted(!isMuted);
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <icons.mute /> : <icons.volumeUp />}
      </button>
    </div>
  );
};

const PlayButton = () => {
  const isPlaying = useStore(state => state.isPlaying);
  
  return (
    <button 
      onClick={() => AudioController.togglePlayback()}
      title={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? <icons.pause /> : <icons.play />}
    </button>
  );
};

export default Controls;