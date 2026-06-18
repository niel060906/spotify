from ytmusicapi import YTMusic
from .cache import get_cache, set_cache

ytmusic = YTMusic()

def search_all(query):
    cache_key = f"search_{query}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    results = ytmusic.search(query)
    
    songs = []
    artists = []
    albums = []
    playlists = []
    
    for item in results:
        category = item.get('category', '').lower()
        if category == 'songs' or item.get('resultType') == 'song':
            songs.append(format_song(item))
        elif category == 'artists' or item.get('resultType') == 'artist':
            artists.append({
                'id': item.get('browseId'),
                'name': item.get('artist'),
                'thumbnail': get_thumbnail(item.get('thumbnails'))
            })
        elif category == 'albums' or item.get('resultType') == 'album':
            albums.append({
                'id': item.get('browseId'),
                'title': item.get('title'),
                'artist': get_artist_name(item.get('artists')),
                'thumbnail': get_thumbnail(item.get('thumbnails'))
            })
        elif category == 'playlists' or item.get('resultType') == 'playlist':
            playlists.append({
                'id': item.get('browseId'),
                'title': item.get('title'),
                'author': item.get('author'),
                'thumbnail': get_thumbnail(item.get('thumbnails'))
            })

    output = {
        'songs': songs,
        'artists': artists,
        'albums': albums,
        'playlists': playlists
    }
    
    set_cache(cache_key, output, ttl=3600)
    return output

def get_trending():
    cache_key = "trending"
    cached = get_cache(cache_key)
    if cached:
        return cached
        
    # Get explore page data or generic charts
    charts = ytmusic.get_charts(country='ID') # Default to ID
    
    output = {
        'top_songs': [format_song(s) for s in charts.get('videos', {}).get('items', [])],
        'top_artists': charts.get('artists', {}).get('items', []),
        'top_playlists': [] # ytmusicapi doesn't always return trending playlists here, handle gracefully
    }
    
    set_cache(cache_key, output, ttl=3600)
    return output

def get_charts():
    return get_trending()

def format_song(item):
    return {
        'video_id': item.get('videoId'),
        'title': item.get('title'),
        'artist': get_artist_name(item.get('artists')),
        'album': item.get('album', {}).get('name') if item.get('album') else '',
        'duration': item.get('duration'),
        'thumbnail': get_thumbnail(item.get('thumbnails'))
    }

def get_artist_name(artists):
    if not artists:
        return ''
    if isinstance(artists, str):
        return artists
    if isinstance(artists, list):
        return ', '.join([a.get('name', '') for a in artists if 'name' in a])
    return ''

def get_thumbnail(thumbnails):
    if not thumbnails:
        return ''
    # Get highest quality
    if isinstance(thumbnails, list):
        return thumbnails[-1].get('url')
    return thumbnails
