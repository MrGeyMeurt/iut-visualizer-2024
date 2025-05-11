import gsap from "gsap";
import detect from "bpm-detective";
import { useStore } from "../utils/store";

class AudioController {
  constructor() {
    this.audio = null;
    this.ctx = null;
    this.isContextStarted = false;
    this.fdata = null;
    this.bpm = null;
    this.analyserNode = null;
    this.audioSource = null;
  }

  async setup() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
      this.audio.volume = 0.1;

      this.audio.addEventListener('timeupdate', this.updateTime);
      this.audio.addEventListener('loadedmetadata', this.updateDuration);
      this.audio.addEventListener('ended', this.playNext);
      this.audio.addEventListener('play', () => useStore.getState().setIsPlaying(true));
      this.audio.addEventListener('pause', () => useStore.getState().setIsPlaying(false));
      
      gsap.ticker.add(this.tick);
    }

    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 1024;
      this.fdata = new Uint8Array(this.analyserNode.frequencyBinCount);
    }

    if (!this.audioSource && this.audio && this.ctx) {
      this.audioSource = this.ctx.createMediaElementSource(this.audio);
      this.audioSource.connect(this.analyserNode);
      this.audioSource.connect(this.ctx.destination);
    }
  }

  async handleFirstInteraction() {
    if (!this.isContextStarted && this.ctx?.state === 'suspended') {
      await this.ctx.resume();
      this.isContextStarted = true;
    }
  }

  async play(src) {
    try {
      await this.setup();
      await this.handleFirstInteraction();

      if (!src) throw new Error('No audio source provided');

      this.audio.pause();
      this.audio.src = src;
      
      await new Promise((resolve, reject) => {
        this.audio.addEventListener('loadedmetadata', resolve);
        this.audio.addEventListener('error', reject);
        this.audio.load();
      });

      await this.audio.play();

      useStore.getState().setCurrentTrackSrc(src);
      
    } catch (error) {
      console.error("Playback error:", error);
      this.playNext();
    }
  }

  tick = () => {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(this.fdata);
    }
  };

  updateTime = () => {
    useStore.getState().setCurrentTime(this.audio?.currentTime || 0);
  };

  updateDuration = () => {
    useStore.getState().setDuration(this.audio?.duration || 0);
  };

  async detectBPM() {
    try {
      if (!this.audio.src) return;
      
      const response = await fetch(this.audio.src);
      const buffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(buffer);
      
      this.bpm = detect(audioBuffer);
      useStore.getState().setBPM(this.bpm);
      
    } catch (error) {
      console.error("BPM detection failed:", error);
    }
  }

  playNext = () => {
    const { queue, tracks = [], currentTrackIndex, isShuffle } = useStore.getState();
    
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

window.addEventListener('click', async () => {
  await audioController.handleFirstInteraction();
});

export default audioController;