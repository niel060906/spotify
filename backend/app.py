import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from modules.database import init_db, get_connection
from modules.search import search_all, get_trending, get_charts
from modules.stream import get_stream_url, get_song_detail
from modules.artist import get_artist
from modules.album import get_album
from modules.playlist import get_playlist, import_playlist
from modules.download import start_download, get_downloads, delete_download
from modules.lyrics import get_lyrics

app = Flask(__name__)
CORS(app)

# Init Database
init_db()

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "Empty query"}), 400
    try:
        return jsonify(search_all(query))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trending', methods=['GET'])
def trending():
    try:
        return jsonify(get_trending())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/charts', methods=['GET'])
def charts():
    try:
        return jsonify(get_charts())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/song/<video_id>', methods=['GET'])
def song_detail(video_id):
    try:
        return jsonify(get_song_detail(video_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/artist/<artist_id>', methods=['GET'])
def artist_detail(artist_id):
    try:
        return jsonify(get_artist(artist_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/album/<album_id>', methods=['GET'])
def album_detail(album_id):
    try:
        return jsonify(get_album(album_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/playlist/<playlist_id>', methods=['GET'])
def playlist_detail(playlist_id):
    try:
        return jsonify(get_playlist(playlist_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/import-playlist', methods=['POST'])
def import_pl():
    data = request.get_json()
    playlist_id = data.get('playlist_id')
    if not playlist_id:
        return jsonify({"error": "playlist_id is required"}), 400
    try:
        return jsonify(import_playlist(playlist_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stream/<video_id>', methods=['GET'])
def stream(video_id):
    try:
        return jsonify(get_stream_url(video_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download():
    data = request.get_json()
    video_id = data.get('video_id')
    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    try:
        return jsonify(start_download(video_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/downloads', methods=['GET'])
def list_downloads():
    try:
        return jsonify(get_downloads())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download-status/<video_id>', methods=['GET'])
def download_status(video_id):
    conn = get_connection()
    row = conn.execute('SELECT * FROM downloads WHERE video_id = ?', (video_id,)).fetchone()
    conn.close()
    if row:
        return jsonify(dict(row))
    return jsonify({"status": "not_found"}), 404

@app.route('/api/download/<video_id>', methods=['DELETE'])
def remove_download(video_id):
    try:
        return jsonify(delete_download(video_id))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/favorite', methods=['POST'])
def add_favorite():
    data = request.get_json()
    video_id = data.get('video_id')
    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    conn = get_connection()
    conn.execute('INSERT OR IGNORE INTO favorites (video_id) VALUES (?)', (video_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/favorite/<video_id>', methods=['DELETE'])
def rm_favorite(video_id):
    conn = get_connection()
    conn.execute('DELETE FROM favorites WHERE video_id = ?', (video_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    conn = get_connection()
    rows = conn.execute('SELECT video_id FROM favorites ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.get_json()
    video_id = data.get('video_id')
    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    conn = get_connection()
    conn.execute('INSERT INTO history (video_id) VALUES (?)', (video_id,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/history', methods=['GET'])
def get_history_api():
    conn = get_connection()
    rows = conn.execute('SELECT video_id, played_at FROM history ORDER BY played_at DESC LIMIT 50').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/lyrics/<video_id>', methods=['GET'])
def fetch_lyrics(video_id):
    title = request.args.get('title', '')
    artist = request.args.get('artist', '')
    try:
        return jsonify(get_lyrics(video_id, title, artist))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    try:
        # Simplistic recommendations based on trending for now
        # In real app, we would query YTMusic API for related to history
        return jsonify(get_trending())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_connection()
    stats = {}
    stats['total_songs'] = conn.execute('SELECT COUNT(*) FROM songs').fetchone()[0]
    stats['total_playlists'] = conn.execute('SELECT COUNT(*) FROM playlists').fetchone()[0]
    stats['total_downloads'] = conn.execute('SELECT COUNT(*) FROM downloads WHERE status="completed"').fetchone()[0]
    stats['total_favorites'] = conn.execute('SELECT COUNT(*) FROM favorites').fetchone()[0]
    stats['total_lyrics'] = conn.execute('SELECT COUNT(*) FROM lyrics').fetchone()[0]
    conn.close()
    return jsonify(stats)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
