import gsap from "gsap";
import detect from "bpm-detective";
import { useStore } from "../utils/store";

class AudioController {
  constructor() {
    this.audio = null;
    this.ctx = null;
    this.updateInterval = null;
  }

  setup() {

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => {
        useStore.getState().setCurrentTrackSrc(null);
      });
      this.audio.addEventListener('play', () => useStore.getState().setIsPlaying(true));
      this.audio.addEventListener('pause', () => useStore.getState().setIsPlaying(false));
      
      // Créer le contexte audio une seule fois
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Configurer la chaîne audio une seule fois
      this.analyserNode = new AnalyserNode(this.ctx, {
        fftSize: 1024,
        smoothingTimeConstant: 0.8,
      });
      
      this.audioSource = this.ctx.createMediaElementSource(this.audio);
      this.audioSource.connect(this.analyserNode);
      this.audioSource.connect(this.ctx.destination);
      
      // Démarrer le contexte audio au premier clic
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    this.audio.addEventListener('timeupdate', this.updateTime);
    this.audio.addEventListener('loadedmetadata', this.updateDuration);

    this.audio.addEventListener('ended', this.playNext);

    this.audio.crossOrigin = "anonymous";
    this.bpm = null;

    // this.audio.src = danceTheNight;
    this.audio.volume = 0.1;

    this.fdata = new Uint8Array(this.analyserNode.frequencyBinCount);

    gsap.ticker.add(this.tick);

    this.audio.addEventListener("loadeddata", async () => {
      await this.detectBPM();
      // console.log(`The BPM is: ${bpm}`);
    });
  }

  detectBPM = async () => {
    // Create an offline audio context to process the data
    const offlineCtx = new OfflineAudioContext(
      1,
      this.audio.duration * this.ctx.sampleRate,
      this.ctx.sampleRate
    );
    // Decode the current audio data
    const response = await fetch(this.audio.src); // Fetch the audio file
    const buffer = await response.arrayBuffer();
    const audioBuffer = await offlineCtx.decodeAudioData(buffer);
    // Use bpm-detective to detect the BPM
    this.bpm = detect(audioBuffer);
    // console.log(`Detected BPM: ${this.bpm}`);
    // return bpm;
  };

  play = (src) => {
    if (!this.audio || !this.ctx) this.setup();
    this.audio.src = src;
    this.audio.play().catch(error => {
      console.error("Erreur de lecture:", error);
    });
  };

  playNext = () => {
    const { queue, tracks, currentTrackIndex, isShuffle } = useStore.getState();
    
    if (queue.length > 0) {
      const [nextTrack, ...remaining] = queue;
      this.play(nextTrack.preview);
      useStore.setState({ queue: remaining });
    } else if (tracks.length > 0) {
      let newIndex;
      if (isShuffle) {
        do {
          newIndex = Math.floor(Math.random() * tracks.length);
        } while (newIndex === currentTrackIndex && tracks.length > 1);
      } else {
        newIndex = (currentTrackIndex + 1) % tracks.length;
      }
      this.play(tracks[newIndex].preview);
      useStore.setState({ currentTrackIndex: newIndex });
    }
  };

  tick = () => {
    this.analyserNode.getByteFrequencyData(this.fdata);
  };

  updateTime = () => {
    useStore.getState().setCurrentTime(this.audio.currentTime);
  };

  updateDuration = () => {
    useStore.getState().setDuration(this.audio.duration);
  };

  togglePlayback = () => {
    if (this.audio.paused) {
      this.audio.play();
      useStore.getState().setIsPlaying(true);
    } else {
      this.audio.pause();
      useStore.getState().setIsPlaying(false);
    }
  };

  nextTrack = () => {
    const { tracks, currentTrackIndex, isShuffle } = useStore.getState();
    let newIndex = currentTrackIndex;

    if (isShuffle) {
      do {
        newIndex = Math.floor(Math.random() * tracks.length);
      } while (newIndex === currentTrackIndex && tracks.length > 1);
    } else {
      newIndex = (currentTrackIndex + 1) % tracks.length;
    }

    this.play(tracks[newIndex].preview);
    useStore.getState().setCurrentTrackSrc(tracks[newIndex].preview);
    useStore.getState().setCurrentTrackIndex(newIndex);
  };

  previousTrack = () => {
    const { tracks, currentTrackIndex } = useStore.getState();
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    this.play(tracks[prevIndex].preview);
    useStore.getState().setCurrentTrackSrc(tracks[prevIndex].preview);
    useStore.getState().setCurrentTrackIndex(prevIndex);
  };

  toggleMute() {
    if (this.audio) {
      this.audio.muted = !this.audio.muted;
    }
  }
}

const audioController = new AudioController();

export default audioController;
