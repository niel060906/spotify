import React, { useState, useEffect, useCallback } from 'react';
import { searchMusic } from '../services/api';
import { usePlayerStore } from '../store';
import { Play, Search as SearchIcon } from 'lucide-react';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const { playSong, setQueue } = usePlayerStore();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim()) {
                performSearch(query);
            } else {
                setResults(null);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (q) => {
        setLoading(true);
        try {
            const data = await searchMusic(q);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 p-6 pt-16 md:pt-6 h-full max-w-7xl mx-auto">
            <div className="sticky top-0 bg-black pt-2 pb-4 z-10 flex gap-4">
                <div className="relative flex-1 max-w-2xl">
                    <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="What do you want to listen to?" 
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                </div>
            </div>

            {loading && <div className="mt-8 text-neutral-400">Searching...</div>}

            {results?.songs && results.songs.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Songs</h2>
                    <div className="flex flex-col gap-2">
                        {results.songs.map((song) => (
                            <div key={song.video_id} onClick={() => { setQueue(results.songs); playSong(song); }} className="flex items-center gap-4 p-2 hover:bg-neutral-900 rounded-lg cursor-pointer group">
                                <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden relative shadow-sm">
                                    <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play size={16} className="text-white ml-0.5" />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-white font-medium truncate">{song.title}</h3>
                                    <p className="text-sm text-neutral-400 truncate">{song.artist}</p>
                                </div>
                                <div className="text-xs text-neutral-500">{song.duration}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {results?.artists && results.artists.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Artists</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.artists.slice(0, 6).map((artist) => (
                            <div key={artist.id} className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition cursor-pointer text-center">
                                <div className="w-full aspect-square rounded-full overflow-hidden bg-neutral-800 mb-4 shadow-md mx-auto max-w-[160px]">
                                    <img src={artist.thumbnail} alt={artist.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-semibold text-sm truncate text-white">{artist.name}</h3>
                                <p className="text-xs text-neutral-400 mt-1">Artist</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
