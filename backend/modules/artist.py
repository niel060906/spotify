from ytmusicapi import YTMusic
from .search import format_song

ytmusic = YTMusic()

def get_artist(artist_id):
    try:
        artist = ytmusic.get_artist(artist_id)
        
        top_songs = []
        if 'songs' in artist and 'results' in artist['songs']:
            for track in artist['songs']['results']:
                top_songs.append(format_song(track))
                
        albums = []
        if 'albums' in artist and 'results' in artist['albums']:
            for album in artist['albums']['results']:
                albums.append({
                    'id': album.get('browseId'),
                    'title': album.get('title'),
                    'thumbnail': album.get('thumbnails', [{'url': ''}])[-1].get('url'),
                    'year': album.get('year')
                })
                
        singles = []
        if 'singles' in artist and 'results' in artist['singles']:
            for single in artist['singles']['results']:
                singles.append({
                    'id': single.get('browseId'),
                    'title': single.get('title'),
                    'thumbnail': single.get('thumbnails', [{'url': ''}])[-1].get('url'),
                    'year': single.get('year')
                })

        return {
            'name': artist.get('name'),
            'description': artist.get('description'),
            'subscribers': artist.get('subscribers'),
            'thumbnails': artist.get('thumbnails'),
            'top_songs': top_songs,
            'albums': albums,
            'singles': singles
        }
    except Exception as e:
        return {"error": str(e)}
