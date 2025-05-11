  import { create } from "zustand";
  import TRACKS from "./TRACKS";
  
  export const useStore = create((set) => ({
    // defaultTracks: TRACKS,
    
    // la liste processed par la librairie, et prête à être rendue dans le DOM
    tracks: [],
    setTracks: (_tracks) => set({ tracks: _tracks }),
    currentTrackSrc: null,
    setCurrentTrackSrc: (src) => set({ currentTrackSrc: src }),
    // Ajouter les nouveaux états
    currentTime: 0,
    setCurrentTime: (time) => set({ currentTime: time }),
    duration: 0,
    setDuration: (duration) => set({ duration }),
    isPlaying: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    currentTrackIndex: 0,
    setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
    filterText: '',
    setFilterText: (text) => set({ filterText: text }),
    loading: false,
    setLoading: (state) => set({ loading: state }),

    isMuted: false,
    setIsMuted: (muted) => set({ isMuted: muted }),
    isShuffle: false,
    setIsShuffle: (shuffle) => set({ isShuffle: shuffle }),

    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    setFavorites: (favorites) => {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      set({ favorites });
    },
  }));