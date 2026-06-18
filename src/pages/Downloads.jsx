import React, { useEffect, useState } from 'react';
import { getDownloads, deleteDownload } from '../services/api';
import { Trash2, Music } from 'lucide-react';

export default function Downloads() {
    const [downloads, setDownloads] = useState([]);
    
    const fetchDownloads = async () => {
        try {
            const data = await getDownloads();
            setDownloads(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchDownloads();
        const interval = setInterval(fetchDownloads, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (videoId) => {
        try {
            await deleteDownload(videoId);
            fetchDownloads();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="pb-24 p-6 pt-16 md:pt-6 h-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-sans tracking-tight mb-8">Downloads</h1>
            
            <div className="space-y-4">
                {downloads.length === 0 ? (
                    <div className="text-neutral-500 py-12 text-center">No downloads yet.</div>
                ) : (
                    downloads.map((d) => (
                        <div key={d.video_id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                <div className="w-12 h-12 bg-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                                    <Music size={20} className="text-neutral-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-semibold text-white truncate">{d.title || d.video_id}</h3>
                                    <div className="text-xs text-neutral-400 mt-1 capitalize shadow-sm">
                                        Status: {d.status} • {d.progress}%
                                    </div>
                                    {d.status === 'downloading' && (
                                        <div className="w-full h-1 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-white transition-all duration-300" style={{ width: `${d.progress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(d.video_id)} className="p-3 text-red-400 hover:bg-neutral-800 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
