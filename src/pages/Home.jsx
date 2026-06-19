import React, { useEffect, useState } from 'react';
import { getTrending, MOCK_DATA } from '../services/api';
import { usePlayerStore } from '../store';
import { Play } from 'lucide-react';

export default function Home() {
    const [trending, setTrending] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { playSong, setQueue } = usePlayerStore();

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const data = await getTrending();
                setTrending(data);
            } catch (err) {
                console.error(err);
                setError("Could not load trending right now.");
                setTrending(MOCK_DATA.trending);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const handlePlaySong = (song, queue = []) => {
        if(queue.length > 0) {
            setQueue(queue);
        }
        playSong(song);
    };

    if (loading) return <div className="p-8 text-neutral-400">Loading...</div>;
    
    return (
        <div className="pb-24 p-6 pt-16 md:pt-6 h-full max-w-7xl mx-auto space-y-12">
            <h1 className="text-3xl font-bold font-sans tracking-tight mb-8">Discover</h1>
            
            {error && (
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                    <p className="text-neutral-400 text-sm mb-4">Python Backend Connection Failed</p>
                    <p className="text-white text-sm mb-4">Since this preview environment cannot run the native Python backend, the API calls will fail here. But don't worry, the complete Python code is provided in the repository! You can export it and run it on Termux.</p>
                </div>
            )}

            {trending?.top_songs && trending.top_songs.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-6">Top Songs</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {trending.top_songs.slice(0, 12).map((song) => (
                            <div key={song.video_id} className="group relative bg-neutral-900 rounded-lg p-3 hover:bg-neutral-800 transition cursor-pointer" onClick={() => handlePlaySong(song, trending.top_songs)}>
                                <div className="aspect-square w-full rounded-md overflow-hidden bg-neutral-800 mb-3 relative shadow-md">
                                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white rounded-full p-3 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <Play size={20} className="text-black ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm truncate text-white">{song.title}</h3>
                                <p className="text-xs text-neutral-400 mt-1 truncate">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
