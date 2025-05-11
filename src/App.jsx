import Canvas from "./components/Canvas/Canvas";
import Landing from "./components/Landing/Landing";
import Dropzone from "./components/Dropzone/Dropzone";
import Tracks from "./components/Tracks/Tracks";
import Picker from "./components/Picker/Picker";
import Controls from "./components/Controls/Controls";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import CurrentTrack from "./components/CurrentTrack/CurrentTrack";
import Loader from "./components/Loader/Loader";
import { useStore } from "./utils/store";

function App() {
  const loading = useStore(state => state.loading);

  return (
    <>
      {loading && <Loader />}
      <Landing />
      <Dropzone />
      <Picker />
      <Controls />
      <ProgressBar />
      <CurrentTrack />
      <Tracks />
      <Canvas />
    </>
  );
}

export default App;
