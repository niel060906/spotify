from ytmusicapi import YTMusic
from .cache import get_cache, set_cache

ytmusic = YTMusic()

FALLBACK_TRENDING = {
    'top_songs': [
        {
            'video_id': 'm1',
            'title': 'Midnight City',
            'artist': 'M83',
            'album': 'Hurry Up, We’re Dreaming',
            'duration': 243,
            'thumbnail': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80'
        },
        {
            'video_id': 'm2',
            'title': 'Blinding Lights',
            'artist': 'The Weeknd',
            'album': 'After Hours',
            'duration': 200,
            'thumbnail': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80'
        },
        {
            'video_id': 'm3',
            'title': 'Levitating',
            'artist': 'Dua Lipa',
            'album': 'Future Nostalgia',
            'duration': 203,
            'thumbnail': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'
        }
    ],
    'top_artists': [],
    'top_playlists': []
}

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
    
    try:
        # Get explore page data or generic charts
        charts = ytmusic.get_charts(country='ID')  # Default to ID
        
        output = {
            'top_songs': [format_song(s) for s in charts.get('videos', {}).get('items', [])],
            'top_artists': charts.get('artists', {}).get('items', []),
            'top_playlists': []  # ytmusicapi doesn't always return trending playlists here, handle gracefully
        }
    except (IndexError, KeyError, Exception) as e:
        # Fallback when ytmusicapi fails - return static trending data
        print(f"Warning: get_charts failed: {e}, returning static fallback trending")
        output = FALLBACK_TRENDING

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
        if len(thumbnails) > 0:
            return thumbnails[-1].get('url', '')
        return ''
    return thumbnails
