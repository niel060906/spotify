from ytmusicapi import YTMusic
from .search import format_song
from .database import get_connection

ytmusic = YTMusic()

def get_playlist(playlist_id):
    try:
        playlist = ytmusic.get_playlist(playlist_id)
        tracks = []
        for track in playlist.get('tracks', []):
            tracks.append(format_song(track))
            
        return {
            'id': playlist.get('id'),
            'title': playlist.get('title'),
            'author': playlist.get('author', {}).get('name') if isinstance(playlist.get('author'), dict) else playlist.get('author'),
            'thumbnail': playlist.get('thumbnails', [{'url': ''}])[-1].get('url'),
            'song_count': playlist.get('trackCount'),
            'songs': tracks
        }
    except Exception as e:
        return {"error": str(e)}

def import_playlist(playlist_id):
    data = get_playlist(playlist_id)
    if 'error' in data:
        return data
        
    conn = get_connection()
    c = conn.cursor()
    
    # Save playlist metadata
    c.execute('''
    INSERT OR REPLACE INTO playlists (playlist_id, title, author, song_count)
    VALUES (?, ?, ?, ?)
    ''', (playlist_id, data.get('title'), data.get('author'), data.get('song_count')))
    
    # Save songs
    for song in data.get('songs', []):
        c.execute('''
        INSERT OR IGNORE INTO songs (video_id, title, artist, album, duration, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (song.get('video_id'), song.get('title'), song.get('artist'), song.get('album'), song.get('duration'), song.get('thumbnail')))
        
    conn.commit()
    conn.close()
    
    return {"status": "success", "imported": len(data.get('songs', []))}
