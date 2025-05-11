// components/TextFilter/TextFilter.jsx
import { useStore } from "../../utils/store";

const TextFilter = () => {
  const setFilterText = useStore(state => state.setFilterText);

  return (
    <input
      type="text"
      placeholder="Filter tracks..."
      onChange={(e) => setFilterText(e.target.value)}
      className={s.filterInput}
    />
  );
};

// Dans le store
export const useStore = create((set) => ({
  // ... autres états
  filterText: '',
  setFilterText: (text) => set({ filterText: text }),
}));

// Mettez à jour Tracks.jsx
const Tracks = () => {
  const { tracks, filterText } = useStore();

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(filterText.toLowerCase()) ||
    track.artists.some(artist => 
      artist.toLowerCase().includes(filterText.toLowerCase())
    )
  );

  return (
    // ... utiliser filteredTracks au lieu de tracks
    {filteredTracks.map((track, i) => (
      // ...
    ))}
  );
};