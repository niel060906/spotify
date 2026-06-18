import yt_dlp
from .database import get_connection
from ytmusicapi import YTMusic

ytmusic = YTMusic()

def get_stream_url(video_id):
    # Check if url saved in db and not expired? Actually yt-dlp urls expire quickly.
    # We must fetch fresh url.
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False
    }
    
    url = f"https://music.youtube.com/watch?v={video_id}"
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
            audio_url = info.get('url')
            
            # Save metadata to DB to build library
            conn = get_connection()
            c = conn.cursor()
            
            title = info.get('title')
            artist = info.get('uploader')
            duration = info.get('duration')
            thumbnail = info.get('thumbnail')
            
            c.execute('''
            INSERT OR REPLACE INTO songs (video_id, title, artist, duration, thumbnail, stream_url)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (video_id, title, artist, duration, thumbnail, audio_url))
            conn.commit()
            conn.close()
            
            return {
                "video_id": video_id,
                "title": title,
                "artist": artist,
                "duration": duration,
                "thumbnail": thumbnail,
                "audio_url": audio_url,
                "bitrate": info.get('abr', 128)
            }
        except Exception as e:
            return {"error": str(e)}

def get_song_detail(video_id):
    try:
        song = ytmusic.get_song(video_id)
        video_details = song.get('videoDetails', {})
        
        related = []
        try:
            watch_playlist = ytmusic.get_watch_playlist(videoId=video_id)
            for tk in watch_playlist.get('tracks', []):
                if tk.get('videoId') != video_id:
                    related.append({
                        'video_id': tk.get('videoId'),
                        'title': tk.get('title'),
                        'artist': tk.get('artists', [{'name': ''}])[0].get('name'),
                        'thumbnail': tk.get('thumbnail', [{'url': ''}])[-1].get('url')
                    })
        except:
            pass
            
        return {
            'video_id': video_id,
            'title': video_details.get('title'),
            'artist': video_details.get('author'),
            'duration': video_details.get('lengthSeconds'),
            'thumbnail': video_details.get('thumbnail', {}).get('thumbnails', [{}])[-1].get('url'),
            'views': video_details.get('viewCount'),
            'related_songs': related
        }
    except Exception as e:
        return {"error": str(e)}
