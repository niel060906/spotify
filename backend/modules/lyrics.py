import requests
import json
import time
from .database import get_connection

def get_lyrics(video_id, title, artist):
    # Check cache first
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM lyrics WHERE video_id = ?', (video_id,))
    cached = c.fetchone()
    
    if cached:
        # Check TTL 30 days
        created_at = cached['created_at'] # Timestamp str
        # Simplistic TTL check could be added, but for now just use cache
        conn.close()
        return {
            "video_id": video_id,
            "title": cached['title'],
            "artist": cached['artist'],
            "synced": bool(cached['synced']),
            "provider": cached['provider'],
            "lyrics": json.loads(cached['lyrics_json'])
        }
        
    # Search LRCLIB
    try:
        url = "https://lrclib.net/api/search"
        params = {"track_name": title, "artist_name": artist}
        res = requests.get(url, params=params, timeout=10).json()
        
        if res and isinstance(res, list) and len(res) > 0:
            track = res[0]
            synced_lyrics = track.get('syncedLyrics')
            plain_lyrics = track.get('plainLyrics')
            
            lyrics_data = []
            is_synced = False
            
            if synced_lyrics:
                is_synced = True
                # Parse LRC format
                lines = synced_lyrics.split('\n')
                for line in lines:
                    if line.startswith('['):
                        parts = line.split(']', 1)
                        if len(parts) == 2:
                            time_str = parts[0][1:]
                            text = parts[1].strip()
                            # Convert mm:ss.xx to seconds
                            t_parts = time_str.split(':')
                            if len(t_parts) == 2:
                                try:
                                    seconds = int(t_parts[0]) * 60 + float(t_parts[1])
                                    lyrics_data.append({"time": seconds, "text": text})
                                except:
                                    pass
            elif plain_lyrics:
                lines = plain_lyrics.split('\n')
                for i, text in enumerate(lines):
                    lyrics_data.append({"time": i * 5, "text": text}) # Dummy time for unsynced
                    
            if lyrics_data:
                c.execute('''
                INSERT OR REPLACE INTO lyrics (video_id, title, artist, provider, synced, lyrics_json)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (video_id, title, artist, 'lrclib', int(is_synced), json.dumps(lyrics_data)))
                conn.commit()
                conn.close()
                
                return {
                    "video_id": video_id,
                    "title": title,
                    "artist": artist,
                    "synced": is_synced,
                    "provider": "lrclib",
                    "lyrics": lyrics_data
                }
    except Exception as e:
        print("Lyrics error:", e)
        pass
        
    conn.close()
    return {"error": "Lyrics not found"}
