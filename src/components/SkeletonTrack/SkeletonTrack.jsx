import s from "./SkeletonTrack.module.scss";

const SkeletonTrack = () => {
  return (
    <div className={s.skeletonTrack}>
      <span className={s.order}></span>
      <div className={s.title}>
        <div className={s.cover}></div>
        <div className={s.details}>
          <span className={s.line}></span>
          <span className={s.sublime}></span>
        </div>
      </div>
      <span className={s.duration}></span>
    </div>
  );
};

export default SkeletonTrack;