import json
import os
from datetime import datetime, timedelta
import threading
import time

class CacheManager:
    def __init__(self, cache_dir="cache"):
        self.cache_dir = cache_dir
        self.cache_files = {
            'trains': 'trains.json',
            'stations': 'stations.json', 
            'status': 'status.json',
            'positions': 'positions.json'
        }
        self.cache_expiry = 30  # seconds
        self.last_update = {}
        
        # Create cache directory if it doesn't exist
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
            
        # Initialize cache files if they don't exist
        self._init_cache_files()
        
    def _init_cache_files(self):
        """Initialize cache files with empty data if they don't exist"""
        for cache_type, filename in self.cache_files.items():
            filepath = os.path.join(self.cache_dir, filename)
            if not os.path.exists(filepath):
                initial_data = {
                    'data': [],
                    'last_updated': datetime.now().isoformat(),
                    'success': True
                }
                self._write_cache(cache_type, initial_data)
    
    def _get_cache_path(self, cache_type):
        """Get full path for cache file"""
        return os.path.join(self.cache_dir, self.cache_files[cache_type])
    
    def _write_cache(self, cache_type, data):
        """Write data to cache file"""
        try:
            filepath = self._get_cache_path(cache_type)
            cache_data = {
                'data': data,
                'last_updated': datetime.now().isoformat(),
                'success': True,
                'cache_type': cache_type
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, ensure_ascii=False, indent=2)
            
            self.last_update[cache_type] = datetime.now()
            print(f"✅ Cache updated: {cache_type} at {datetime.now().strftime('%H:%M:%S')}")
            
        except Exception as e:
            print(f"❌ Error writing cache {cache_type}: {e}")
    
    def _read_cache(self, cache_type):
        """Read data from cache file"""
        try:
            filepath = self._get_cache_path(cache_type)
            
            if not os.path.exists(filepath):
                return None
                
            with open(filepath, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            return cache_data
            
        except Exception as e:
            print(f"❌ Error reading cache {cache_type}: {e}")
            return None
    
    def is_cache_expired(self, cache_type):
        """Check if cache is expired"""
        if cache_type not in self.last_update:
            return True
            
        time_diff = datetime.now() - self.last_update[cache_type]
        return time_diff.total_seconds() > self.cache_expiry
    
    def get_cached_data(self, cache_type):
        """Get cached data, return None if expired or doesn't exist"""
        cache_data = self._read_cache(cache_type)
        
        if not cache_data:
            return None
            
        # Check if cache is expired
        try:
            last_updated = datetime.fromisoformat(cache_data['last_updated'])
            time_diff = datetime.now() - last_updated
            
            if time_diff.total_seconds() > self.cache_expiry:
                print(f"⏰ Cache expired for {cache_type} (age: {time_diff.total_seconds():.1f}s)")
                return None
                
        except Exception as e:
            print(f"❌ Error checking cache expiry for {cache_type}: {e}")
            return None
            
        return cache_data
    
    def update_cache(self, cache_type, data):
        """Update cache with new data"""
        self._write_cache(cache_type, data)
    
    def get_cache_info(self):
        """Get information about all cache files"""
        info = {}
        
        for cache_type in self.cache_files.keys():
            cache_data = self._read_cache(cache_type)
            
            if cache_data:
                info[cache_type] = {
                    'last_updated': cache_data['last_updated'],
                    'exists': True,
                    'file_size': os.path.getsize(self._get_cache_path(cache_type))
                }
            else:
                info[cache_type] = {
                    'last_updated': None,
                    'exists': False,
                    'file_size': 0
                }
        
        return info
    
    def clear_cache(self, cache_type=None):
        """Clear cache files"""
        if cache_type:
            filepath = self._get_cache_path(cache_type)
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"🗑️ Cleared cache: {cache_type}")
        else:
            # Clear all cache files
            for cache_type in self.cache_files.keys():
                filepath = self._get_cache_path(cache_type)
                if os.path.exists(filepath):
                    os.remove(filepath)
            print("🗑️ Cleared all cache files")
    
    def start_auto_refresh(self, refresh_callback, interval=30):
        """Start automatic cache refresh in background"""
        def refresh_worker():
            while True:
                try:
                    print(f"🔄 Auto-refreshing cache at {datetime.now().strftime('%H:%M:%S')}")
                    refresh_callback()
                    time.sleep(interval)
                except Exception as e:
                    print(f"❌ Error in auto-refresh: {e}")
                    time.sleep(interval)
        
        refresh_thread = threading.Thread(target=refresh_worker, daemon=True)
        refresh_thread.start()
        print(f"🤖 Auto-refresh started (interval: {interval}s)")
        
    def get_last_update_time(self, cache_type):
        """Get last update time for specific cache type"""
        cache_data = self._read_cache(cache_type)
        if cache_data and 'last_updated' in cache_data:
            return cache_data['last_updated']
        return None