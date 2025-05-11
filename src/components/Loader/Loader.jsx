import s from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={s.loaderContainer}>
      <div className={s.loader}></div>
    </div>
  );
};

export default Loader;