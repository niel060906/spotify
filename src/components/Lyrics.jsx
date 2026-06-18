import React, { useEffect, useRef, useState } from 'react';
import { getLyrics } from '../services/api';

export default function Lyrics({ currentSong, progress, isPlaying, onSeek }) {
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!currentSong) return;
    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const data = await getLyrics(currentSong.video_id, currentSong.title, currentSong.artist);
        if (data.lyrics && data.lyrics.length > 0) {
            setLyricsData(data);
        } else {
            setLyricsData(null);
        }
      } catch (e) {
        setLyricsData(null);
      }
      setLoading(false);
    };
    fetchLyrics();
  }, [currentSong?.video_id]);

  useEffect(() => {
    if (!lyricsData?.synced) return;
    
    // Find active line
    const idx = lyricsData.lyrics.findIndex((l, i) => {
        const nextTime = lyricsData.lyrics[i+1]?.time || Infinity;
        return progress >= l.time && progress < nextTime;
    });

    if (idx !== -1 && scrollRef.current) {
        const activeElement = scrollRef.current.children[idx];
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [progress, lyricsData]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-white/50 text-sm">Loading lyrics...</div>;
  }

  if (!lyricsData || !lyricsData.lyrics || lyricsData.lyrics.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-white/50 gap-4">
            <p className="text-xl font-medium tracking-tight">No lyrics found</p>
            <p className="text-sm">We couldn't find lyrics for this song.</p>
        </div>
    );
  }

  const handleLineClick = (time) => {
    if (lyricsData.synced && onSeek) {
        onSeek(time);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar scroll-smooth p-6 pb-24" ref={scrollRef}>
        <div className="max-w-2xl mx-auto space-y-6 lg:space-y-8 mt-12 mb-32">
            {lyricsData.lyrics.map((line, i) => {
                const isPast = lyricsData.synced && progress >= line.time;
                const nextTime = lyricsData.lyrics[i+1]?.time || Infinity;
                const isActive = lyricsData.synced && progress >= line.time && progress < nextTime;
                
                return (
                    <div 
                        key={i} 
                        onClick={() => handleLineClick(line.time)}
                        className={`text-2xl lg:text-4xl font-bold tracking-tight cursor-pointer transition-all duration-500 ease-out ${isActive ? 'text-white scale-[1.02] origin-left' : (isPast ? 'text-white/60 hover:text-white/80' : 'text-white/30 hover:text-white/50')} filter ${isActive ? 'blur-none' : 'blur-[0.5px] hover:blur-none'}`}
                    >
                        {line.text || '🎙️'}
                    </div>
                )
            })}
        </div>
        <div className="text-center text-xs text-white/30 mt-12 pb-12 uppercase tracking-widest font-mono">
            Provider: {lyricsData.provider}
        </div>
    </div>
  );
}
