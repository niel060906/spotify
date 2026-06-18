import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Maximize2, ChevronDown, ListMusic, Mic2, Settings2, Moon } from 'lucide-react';
import { getStreamUrl, addHistory } from '../services/api';
import Lyrics from './Lyrics';

export default function Player() {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, volume, setVolume, progress, setProgress, duration, setDuration, isShuffle, toggleShuffle, isRepeat, toggleRepeat } = usePlayerStore();
  
  const audioRef = useRef(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    if (currentSong) {
      const fetchStream = async () => {
        setIsLoading(true);
        try {
          const data = await getStreamUrl(currentSong.video_id);
          if (data.audio_url) {
            setStreamUrl(data.audio_url);
            addHistory(currentSong.video_id).catch(() => {});
          }
        } catch (e) {
          console.error("Failed to load stream url", e);
        }
        setIsLoading(false);
      };
      // Reset
      setStreamUrl('');
      setProgress(0);
      fetchStream();

      // Update Media Session
      if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
              title: currentSong.title,
              artist: currentSong.artist,
              artwork: [
                  { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }
              ]
          });
      }
    }
  }, [currentSong?.video_id, currentSong?._repeatTrigger]);

  useEffect(() => {
      // Media Session Handlers
      if ('mediaSession' in navigator) {
          navigator.mediaSession.setActionHandler('play', togglePlay);
          navigator.mediaSession.setActionHandler('pause', togglePlay);
          navigator.mediaSession.setActionHandler('previoustrack', prevSong);
          navigator.mediaSession.setActionHandler('nexttrack', nextSong);
      }
  }, [togglePlay, prevSong, nextSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && streamUrl) {
        audioRef.current.play().catch(e => console.log('Auto-play prevented', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (timeOrEvent) => {
    let value;
    if (typeof timeOrEvent === 'number') {
        value = timeOrEvent;
    } else {
        value = Number(timeOrEvent.target.value);
    }
    
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <audio 
        ref={audioRef}
        src={streamUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextSong}
        autoPlay
      />

      {/* Mini Player */}
      <div 
        className={`fixed bottom-16 md:bottom-auto md:top-auto left-0 right-0 z-50 bg-neutral-900/90 backdrop-blur-xl border-t border-white/10 text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} md:translate-y-0 md:opacity-100 p-2 px-4 shadow-[0_-8px_30px_rgb(0,0,0,0.4)]`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <div 
                className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setIsExpanded(true)}
            >
                <div className="w-12 h-12 flex-shrink-0 bg-neutral-800 rounded-md overflow-hidden relative shadow-md">
                    {currentSong.thumbnail ? <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" /> : null}
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="overflow-hidden flex-1">
                    <h4 className="font-semibold text-sm truncate opacity-90">{currentSong.title || 'Loading...'}</h4>
                    <p className="text-xs text-white/50 truncate mt-0.5">{currentSong.artist}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-center md:flex-none">
                <button onClick={togglePlay} className="p-3 disabled:opacity-50 text-white rounded-full active:scale-95 transition-transform">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />)}
                </button>
                <button onClick={nextSong} className="p-2 text-white/70 hover:text-white hidden md:block active:scale-95 transition-transform">
                    <SkipForward size={24} fill="currentColor" />
                </button>
            </div>

            <div className="flex-1 hidden md:flex items-center justify-end gap-2 text-xs text-neutral-400">
                <span>{formatTime(progress)}</span>
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={progress} 
                    onChange={handleSeek}
                    className="w-32 accent-white h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <span>{formatTime(duration)}</span>
                <button onClick={() => setIsExpanded(true)} className="ml-4 p-2 hover:text-white text-neutral-400">
                    <Maximize2 size={16} />
                </button>
            </div>
        </div>
        
        {/* Progress bar on top of mobile mini player */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 md:hidden">
             <div className="h-full bg-white transition-all duration-300" style={{ width: `${(progress / duration) * 100}%` }}></div>
        </div>
      </div>

      {/* Expanded iOS Apple Music Style Full Player */}
      <div className={`fixed inset-0 z-[100] bg-black text-white flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Dynamic Glass Blur Background from Artwork */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {currentSong.thumbnail && <img src={currentSong.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60 scale-150 blur-3xl" alt="" />}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[60px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col h-full">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-6 mt-safe">
                <button onClick={() => setIsExpanded(false)} className="p-2 text-white/70 hover:text-white backdrop-blur-md bg-white/5 rounded-full">
                    <ChevronDown size={28} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase relative overflow-hidden">
                        {showLyrics ? 'Lyrics' : (showQueue ? 'Playing Next' : 'Now Playing')}
                    </span>
                    <span className="text-xs font-medium text-white/80 mt-1">{currentSong.artist}</span>
                </div>
                <div className="w-12 flex justify-end">
                    <button className="p-2 text-white/70 hover:text-white"><Settings2 size={24} /></button>
                </div>
            </div>

            {/* Main Area: Artwork OR Lyrics OR Queue */}
            <div className="flex-1 overflow-hidden flex flex-col relative w-full items-center justify-center">
                <div className={`absolute inset-0 transition-opacity duration-500 flex flex-col items-center justify-center p-8 ${(showLyrics || showQueue) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="aspect-square w-full max-w-[360px] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/10 ring-1 ring-white/10">
                        {currentSong.thumbnail ? <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" /> : null}
                    </div>
                </div>
                
                <div className={`absolute inset-0 transition-opacity duration-500 ${showLyrics ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     {showLyrics && <Lyrics currentSong={currentSong} progress={progress} isPlaying={isPlaying} onSeek={handleSeek} />}
                </div>
                
                <div className={`absolute inset-0 transition-opacity duration-500 overflow-y-auto pt-8 px-6 pb-24 no-scrollbar ${showQueue ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     {/* Placeholder for Queue List */}
                     <h3 className="text-2xl font-bold mb-6 tracking-tight">Up Next</h3>
                     <div className="text-white/50 text-sm">Queue feature implemented in store, ready for UI binding.</div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full max-w-md mx-auto px-6 pb-safe-bottom mb-8">
                {/* Info */}
                <div className="flex justify-between items-center mb-6">
                    <div className="overflow-hidden flex-1 pr-4 translate-y-0 transition-transform">
                        <h2 className="text-2xl lg:text-3xl font-bold truncate tracking-tight">{currentSong.title}</h2>
                        <p className="text-white/60 text-lg truncate mt-1">{currentSong.artist}</p>
                    </div>
                </div>

                {/* Scrubber */}
                <div className="mb-8">
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 100} 
                        value={progress} 
                        onChange={handleSeek}
                        className="w-full relative z-10 accent-white h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-xs text-white/50 font-medium tracking-wide">
                        <span>{formatTime(progress)}</span>
                        <span>-{formatTime(duration - progress)}</span>
                    </div>
                </div>

                {/* Primary Controls */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={toggleShuffle} className={`p-2 transition-colors active:scale-90 ${isShuffle ? 'text-green-400' : 'text-white/50 hover:text-white'}`}>
                        <Shuffle size={24} />
                    </button>
                    <button onClick={prevSong} className="p-2 text-white hover:text-white/80 active:scale-90 transition-transform">
                        <SkipBack size={48} fill="currentColor" />
                    </button>
                    <button onClick={togglePlay} className="p-4 bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-transform">
                        {isLoading ? <div className="w-12 h-12 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div> : (isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-1" />)}
                    </button>
                    <button onClick={nextSong} className="p-2 text-white hover:text-white/80 active:scale-90 transition-transform">
                        <SkipForward size={48} fill="currentColor" />
                    </button>
                    <button onClick={toggleRepeat} className={`p-2 transition-colors active:scale-90 ${isRepeat ? 'text-green-400' : 'text-white/50 hover:text-white'}`}>
                        <Repeat size={24} />
                    </button>
                </div>
                
                {/* Secondary Modes Tab */}
                <div className="flex justify-center items-center gap-12 pt-4 border-t border-white/10">
                    <button onClick={() => { setShowLyrics(!showLyrics); if(!showLyrics) setShowQueue(false); }} className={`p-2 transition-colors ${showLyrics ? 'text-white bg-white/20 rounded-lg' : 'text-white/50 hover:text-white'}`}>
                        <Mic2 size={24} />
                    </button>
                    <button className="p-2 text-white/50 hover:text-white">
                         <Moon size={24} /> {/* Sleep timer icon placeholder */}
                    </button>
                    <button onClick={() => { setShowQueue(!showQueue); if(!showQueue) setShowLyrics(false); }} className={`p-2 transition-colors ${showQueue ? 'text-white bg-white/20 rounded-lg' : 'text-white/50 hover:text-white'}`}>
                        <ListMusic size={24} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
