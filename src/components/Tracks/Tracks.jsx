import { useEffect, useState } from "react";
import Track from "../Track/Track";
import { useStore } from "../../utils/store";
import { fetchMetadata } from "../../utils/utils";
import TRACKS from "../../utils/TRACKS";
import fetchJsonp from "fetch-jsonp";
import s from "./Tracks.module.scss";
import SkeletonTrack from "../SkeletonTrack/SkeletonTrack";

const Tracks = () => {
  const [showTracks, setShowTracks] = useState(false);
  const { tracks, setTracks, loading,setLoading } = useStore();
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filter, setFilter] = useState('all');
  const { favorites } = useStore();

  const filteredTracks = tracks
    .filter((track) => {
      const matchesText = track.title.toLowerCase().includes(filterText.toLowerCase()) ||
        track.artists?.some(artist => 
          artist.toLowerCase().includes(filterText.toLowerCase())
        );
      const matchesFavorites = filter === 'all' || favorites.includes(track.id);
      return matchesText && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "duration":
          return a.duration - b.duration;
        case "artist":
          return (a.artists?.[0] || '').localeCompare(b.artists?.[0] || '');
        case "default":
        default:
          return filter === 'favorites' 
            ? favorites.indexOf(a.id) - favorites.indexOf(b.id)
            : 0;
      }
    });

  // écouter la variable tracks qui vient du store
  useEffect(() => {
    if (tracks.length > TRACKS.length) {
      setShowTracks(true);
    }
  }, [tracks]);

  useEffect(() => {
    const loadInitialTracks = async () => {
      setLoading(true);
      try {
        await fetchMetadata(TRACKS, tracks, setTracks);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialTracks();
  }, []);

  // TODO : Slider (infini ou non) pour sélectionner les tracks

  // TODO : Récupérer les tracks du store

  const onKeyDown = (e) => {
    if (e.keyCode === 13 && e.target.value !== "") {
      // l'utilisateur a appuyé sur sa touche entrée
      const userInput = e.target.value;

      // appeler la fonction
      getSongs(userInput);
    }
  };

  const getSongs = async (userInput) => {
    setLoading(true);
    try {
      let response = await fetchJsonp(
        `https://api.deezer.com/search?q=${userInput}&output=jsonp`
      );

      if (response.ok) {
        response = await response.json();
        const _tracks = [...tracks];
        response.data.forEach((result) => {
          _tracks.push(result);
        });
        setTracks(_tracks);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={s.toggleTracks} onClick={() => setShowTracks(!showTracks)}>
      Bibliothèque
      </div>
    
      <section className={`${s.wrapper} ${showTracks ? s.wrapper_visible : ""}`}>
        <div className={s.tracks}>
        <div className={s.header}>
          <span className={s.order}>#</span>
          <span className={s.title}>Titre</span>
          <span className={s.duration}>Durée</span>
        </div>
        
        {loading ? (
          Array(8).fill(0).map((_, i) => <SkeletonTrack key={i} />)
        ) : (
          filteredTracks.map((track, i) => (
            <Track
            key={track.id}
            id={track.id}
            title={track.title}
            duration={track.duration}
            cover={track.album.cover_xl}
            artists={track.artists}
            src={track.preview}
            index={i}
            />
          ))
        )}
        </div>
        
        <div className={s.searchContainer}>
          
          
          <button 
          onClick={() => setFilter(current => current === 'all' ? 'favorites' : 'all')}
          className={`${s.favoriteToggle} ${filter === 'favorites' ? s.active : ''}`}
          aria-label={`Afficher ${filter === 'all' ? 'les favoris' : 'tous les morceaux'}`}
          >
            <span className={s.heartIcon}>♥</span>
            {favorites.length > 0 && (
              <span className={s.favoriteCount}>{favorites.length}</span>
            )}
          </button>

        <input
            type="text"
            placeholder="Rechercher ou filtrer les morceaux..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={onKeyDown}
            className={s.searchInput}
          />

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={s.sortSelect}
          >
            <option value="default">Tri</option>
            <option value="name">Nom (A-Z)</option>
            <option value="duration">Durée (croissante)</option>
            <option value="artist">Artiste (A-Z)</option>
          </select>
        </div>
      </section>
    </>
  );
};

export default Tracks;
