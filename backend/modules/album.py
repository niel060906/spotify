from ytmusicapi import YTMusic
from .search import format_song

ytmusic = YTMusic()

def get_album(album_id):
    try:
        album = ytmusic.get_album(album_id)
        
        tracks = []
        for track in album.get('tracks', []):
            tracks.append(format_song(track))
            
        return {
            'title': album.get('title'),
            'artist': album.get('artists', [{'name': ''}])[0].get('name'),
            'year': album.get('year'),
            'trackCount': album.get('trackCount'),
            'thumbnails': album.get('thumbnails'),
            'tracks': tracks
        }
    except Exception as e:
        return {"error": str(e)}
