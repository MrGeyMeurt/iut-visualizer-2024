import { useStore } from "../../utils/store";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import s from "./ProgressBar.module.scss";
import AudioController from "../../utils/AudioController";

const ProgressBar = () => {
  const { currentTime, duration } = useStore();
  const progressRef = useRef();
  const dragProxy = useRef({ x: 0 });
  const timeline = useRef();

  useEffect(() => {
    timeline.current = gsap.timeline({
      onUpdate: () => {
        const progress = dragProxy.current.x / progressRef.current.offsetWidth;
        AudioController.audio.currentTime = progress * duration;
      }
    });

    return () => timeline.current.kill();
  }, []);

  const handleClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const progress = (e.clientX - rect.left) / rect.width;
    AudioController.audio.currentTime = progress * duration;
  };

  return (
    <div className={s.progressContainer} onClick={handleClick} ref={progressRef}>
      <div 
        className={s.progressBar} 
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />
      <div 
        className={s.progressHandle}
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />
    </div>
  );
};

export default ProgressBar;