import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(persist((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,
  isShuffle: false,
  isRepeat: false,
  sleepTimer: null,
  audioQuality: 'auto',
  
  playSong: (song) => {
    set({ currentSong: song, isPlaying: true });
    // Also push to queue if not empty and not in queue
    const { queue } = get();
    if (!queue.find(s => s.video_id === song.video_id)) {
        set({ queue: [song, ...queue] });
    }
  },
  
  setQueue: (songs) => set({ queue: songs }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  nextSong: () => {
    const { queue, currentSong, isShuffle, isRepeat } = get();
    if (queue.length === 0) return;
    
    if (isRepeat && currentSong) {
        set({ currentSong: { ...currentSong, _repeatTrigger: Date.now() }, isPlaying: true, progress: 0 });
        return;
    }
    
    let nextIndex = queue.findIndex(s => s.video_id === currentSong?.video_id) + 1;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
    }
    
    if (nextIndex >= queue.length) nextIndex = 0; // Wrap around
    set({ currentSong: queue[nextIndex], isPlaying: true, progress: 0 });
  },
  
  prevSong: () => {
    const { queue, currentSong, progress } = get();
    // if progress > 3 seconds, just restart song
    if (progress > 3) {
      set({ progress: 0, currentSong: { ...currentSong, _repeatTrigger: Date.now() }, isPlaying: true });
      return;
    }

    if (queue.length === 0) return;
    
    let prevIndex = queue.findIndex(s => s.video_id === currentSong?.video_id) - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;
    
    set({ currentSong: queue[prevIndex], isPlaying: true, progress: 0 });
  },
  
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
  setSleepTimer: (minutes) => set({ sleepTimer: minutes }),
  setAudioQuality: (quality) => set({ audioQuality: quality }),

}), {
  name: 'music-player-storage',
  partialize: (state) => ({
    queue: state.queue,
    currentSong: state.currentSong,
    volume: state.volume,
    isShuffle: state.isShuffle,
    isRepeat: state.isRepeat,
    audioQuality: state.audioQuality
  }),
}));
