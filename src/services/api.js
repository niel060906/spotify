const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const MOCK_DATA = {
  trending: {
    top_songs: [
      { video_id: 'm1', title: 'Midnight City', artist: 'M83', duration: 243, thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
      { video_id: 'm2', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { video_id: 'm3', title: 'Levitating', artist: 'Dua Lipa', duration: 203, thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
      { video_id: 'm4', title: 'As It Was', artist: 'Harry Styles', duration: 167, thumbnail: 'https://images.unsplash.com/photo-1460036521480-c4b50fd04ce3?w=300&q=80' },
      { video_id: 'm5', title: 'Cruel Summer', artist: 'Taylor Swift', duration: 178, thumbnail: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?w=300&q=80' },
      { video_id: 'm6', title: 'Starboy', artist: 'The Weeknd', duration: 230, thumbnail: 'https://images.unsplash.com/photo-1520182205149-1e5e4e7329b4?w=300&q=80' }
    ]
  },
  search: {
    songs: [
        { video_id: 's1', title: 'Search Result 1', artist: 'Demo Artist', duration: 210, thumbnail: 'https://images.unsplash.com/photo-1493225457124-a1a2a5956093?w=300&q=80' },
        { video_id: 's2', title: 'Search Result 2', artist: 'Demo Artist', duration: 180, thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' }
    ],
    artists: [
        { id: 'a1', name: 'Demo Artist', thumbnail: 'https://images.unsplash.com/photo-1520182205149-1e5e4e7329b4?w=300&q=80' }
    ]
  },
  lyrics: {
    video_id: 'm1', title: 'Midnight City', artist: 'M83', synced: true, provider: 'lrclib',
    lyrics: [
        { time: 0, text: 'Waiting in a car' },
        { time: 3.5, text: 'Waiting for a ride in the dark' },
        { time: 8.0, text: 'The night city grows' },
        { time: 12.0, text: 'Look and see her eyes, they glow' },
        { time: 16.5, text: 'Waiting in a car' }
    ]
  }
};

export const fetchApi = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();
    if (!response.ok || data?.error) {
        throw new Error(data?.error || `API error: ${response.status}`);
    }
    return data;
  } catch (error) {
    // If running in preview mode without Python backend, return mock data silently
    if (endpoint === '/trending') return MOCK_DATA.trending;
    if (endpoint === '/recommendations') return MOCK_DATA.trending;
    if (endpoint.startsWith('/search')) return MOCK_DATA.search;
    if (endpoint === '/downloads') return [];
    if (endpoint.startsWith('/stream')) return { audio_url: 'https://traffic.libsyn.com/secure/syntax/Syntax_-_300.mp3' };
    if (endpoint === '/history' && options.method === 'GET') return [];
    if (endpoint.startsWith('/lyrics')) return MOCK_DATA.lyrics;
    if (endpoint === '/stats') return { total_songs: 120, total_playlists: 5, total_downloads: 12, total_favorites: 45, total_lyrics: 80 };
    
    // Only log if not one of the frequent polling calls
    if (endpoint !== '/downloads') {
        console.warn(`Fallback active for ${endpoint} due to fetch error.`);
    }
    throw error;
  }
};

export const searchMusic = (query) => fetchApi(`/search?q=${encodeURIComponent(query)}`);
export const getTrending = () => fetchApi('/trending');
export const getCharts = () => fetchApi('/charts');
export const getSongDetail = (videoId) => fetchApi(`/song/${videoId}`);
export const getArtistDetail = (artistId) => fetchApi(`/artist/${artistId}`);
export const getAlbumDetail = (albumId) => fetchApi(`/album/${albumId}`);
export const getPlaylistDetail = (playlistId) => fetchApi(`/playlist/${playlistId}`);
export const importPlaylist = (playlistId) => fetchApi('/import-playlist', { method: 'POST', body: JSON.stringify({ playlist_id: playlistId }) });
export const getStreamUrl = (videoId) => fetchApi(`/stream/${videoId}`);
export const getLyrics = (videoId, title, artist) => fetchApi(`/lyrics/${videoId}?title=${encodeURIComponent(title || '')}&artist=${encodeURIComponent(artist || '')}`);
export const getRecommendations = () => fetchApi('/recommendations');
export const getStats = () => fetchApi('/stats');

export const downloadSong = (videoId) => fetchApi('/download', { method: 'POST', body: JSON.stringify({ video_id: videoId }) });
export const getDownloads = () => fetchApi('/downloads');
export const getDownloadStatus = (videoId) => fetchApi(`/download-status/${videoId}`);
export const deleteDownload = (videoId) => fetchApi(`/download/${videoId}`, { method: 'DELETE' });

export const addFavorite = (videoId) => fetchApi('/favorite', { method: 'POST', body: JSON.stringify({ video_id: videoId }) });
export const removeFavorite = (videoId) => fetchApi(`/favorite/${videoId}`, { method: 'DELETE' });
export const getFavorites = () => fetchApi('/favorites');

export const addHistory = (videoId) => fetchApi('/history', { method: 'POST', body: JSON.stringify({ video_id: videoId }) });
export const getHistory = () => fetchApi('/history');
