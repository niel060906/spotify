import yt_dlp
import os
import threading
from .database import get_connection

DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'downloads')
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def start_download(video_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM downloads WHERE video_id = ?', (video_id,))
    existing = c.fetchone()
    
    if existing and existing['status'] == 'completed':
        return {"status": "error", "message": "Already downloaded"}
        
    c.execute('''
    INSERT OR REPLACE INTO downloads (video_id, status, progress, file_path)
    VALUES (?, 'starting', 0, '')
    ''', (video_id,))
    conn.commit()
    conn.close()

    thread = threading.Thread(target=_download_thread, args=(video_id,))
    thread.start()
    
    return {"status": "success", "message": "Download started"}

def _download_thread(video_id):
    def progress_hook(d):
        if d['status'] == 'downloading':
            p = d.get('_percent_str', '0%').replace('%', '').strip()
            # Clean ansi escape chars
            import re
            p = re.sub(r'\x1b\[[0-9;]*m', '', p)
            try:
                progress = float(p)
                conn = get_connection()
                conn.execute('UPDATE downloads SET status = ?, progress = ? WHERE video_id = ?', ('downloading', int(progress), video_id))
                conn.commit()
                conn.close()
            except:
                pass
        elif d['status'] == 'finished':
            filepath = d.get('filename')
            conn = get_connection()
            conn.execute('UPDATE downloads SET status = ?, progress = 100, file_path = ? WHERE video_id = ?', ('completed', filepath, video_id))
            conn.commit()
            conn.close()

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(DOWNLOAD_DIR, f'{video_id}.%(ext)s'),
            'progress_hooks': [progress_hook],
            'quiet': True,
            'no_warnings': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://music.youtube.com/watch?v={video_id}"])
    except Exception as e:
        conn = get_connection()
        conn.execute('UPDATE downloads SET status = ? WHERE video_id = ?', ('error', video_id))
        conn.commit()
        conn.close()

def get_downloads():
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM downloads ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    return [dict(ix) for ix in rows]

def delete_download(video_id):
    conn = get_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM downloads WHERE video_id = ?', (video_id,))
    row = c.fetchone()
    
    if row and row['file_path'] and os.path.exists(row['file_path']):
        try:
            os.remove(row['file_path'])
        except:
            pass
            
    c.execute('DELETE FROM downloads WHERE video_id = ?', (video_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}
