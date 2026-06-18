import sqlite3
import json
import time
from .database import get_connection

def set_cache(key, data, ttl=3600):
    conn = get_connection()
    c = conn.cursor()
    # Ensure cache table exists
    c.execute('''
    CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        data TEXT,
        expires_at INTEGER
    )
    ''')
    
    expires_at = int(time.time()) + ttl
    c.execute('REPLACE INTO cache (key, data, expires_at) VALUES (?, ?, ?)', (key, json.dumps(data), expires_at))
    conn.commit()
    conn.close()

def get_cache(key):
    conn = get_connection()
    c = conn.cursor()
    
    # Ensure cache table exists
    c.execute('''
    CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        data TEXT,
        expires_at INTEGER
    )
    ''')
    
    c.execute('SELECT data, expires_at FROM cache WHERE key = ?', (key,))
    row = c.fetchone()
    conn.close()
    
    if row:
        if row['expires_at'] > int(time.time()):
            return json.loads(row['data'])
        else:
            # Delete expired
            conn = get_connection()
            conn.execute('DELETE FROM cache WHERE key = ?', (key,))
            conn.commit()
            conn.close()
    return None
