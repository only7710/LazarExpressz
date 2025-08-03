from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import uuid
from cache_manager import CacheManager

app = Flask(__name__)
CORS(app)

# Initialize cache manager
cache_manager = CacheManager()

# Mock train data - in a real application, this would come from a database or external API
trains_data = [
    {
        "id": "IC001",
        "name": "InterCity Budapest-Debrecen",
        "type": "InterCity",
        "from_station": "Budapest-Keleti",
        "to_station": "Debrecen",
        "departure_time": "08:15",
        "arrival_time": "10:45",
        "current_station": "Szolnok",
        "delay_minutes": 5,
        "status": "running",
        "position": {"lat": 47.1833, "lng": 20.2},
        "route": [
            {"station": "Budapest-Keleti", "time": "08:15", "status": "departed"},
            {"station": "Cegléd", "time": "08:45", "status": "departed"},
            {"station": "Szolnok", "time": "09:25", "status": "current"},
            {"station": "Püspökladány", "time": "10:15", "status": "upcoming"},
            {"station": "Debrecen", "time": "10:45", "status": "upcoming"}
        ]
    },
    {
        "id": "S001",
        "name": "S-Bahn Budapest-Pécs",
        "type": "Sebesvonat",
        "from_station": "Budapest-Déli",
        "to_station": "Pécs",
        "departure_time": "09:30",
        "arrival_time": "12:15",
        "current_station": "Székesfehérvár",
        "delay_minutes": 0,
        "status": "running",
        "position": {"lat": 47.1885, "lng": 18.4114},
        "route": [
            {"station": "Budapest-Déli", "time": "09:30", "status": "departed"},
            {"station": "Székesfehérvár", "time": "10:30", "status": "current"},
            {"station": "Siófok", "time": "11:15", "status": "upcoming"},
            {"station": "Kaposvár", "time": "11:45", "status": "upcoming"},
            {"station": "Pécs", "time": "12:15", "status": "upcoming"}
        ]
    },
    {
        "id": "R001",
        "name": "Regionális Szeged-Budapest",
        "type": "Regionális",
        "from_station": "Szeged",
        "to_station": "Budapest-Nyugati",
        "departure_time": "07:00",
        "arrival_time": "09:45",
        "current_station": "Kecskemét",
        "delay_minutes": 12,
        "status": "delayed",
        "position": {"lat": 46.9073, "lng": 19.6908},
        "route": [
            {"station": "Szeged", "time": "07:00", "status": "departed"},
            {"station": "Kiskunfélegyháza", "time": "07:35", "status": "departed"},
            {"station": "Kecskemét", "time": "08:15", "status": "current"},
            {"station": "Cegléd", "time": "08:55", "status": "upcoming"},
            {"station": "Budapest-Nyugati", "time": "09:45", "status": "upcoming"}
        ]
    }
]

@app.route('/api/trains', methods=['GET'])
def get_trains():
    """Get all trains with optional filtering"""
    # Try to get from cache first
    cached_data = cache_manager.get_cached_data('trains')
    
    if cached_data:
        print("📦 Serving trains from cache")
        filtered_trains = cached_data['data']
    else:
        print("🔄 Generating fresh train data")
        # Simulate slight position changes for realism
        updated_trains = []
        for train in trains_data:
            updated_train = train.copy()
            # Simulate slight position changes
            updated_train['position'] = {
                'lat': train['position']['lat'] + random.uniform(-0.005, 0.005),
                'lng': train['position']['lng'] + random.uniform(-0.005, 0.005)
            }
            # Simulate delay changes
            if random.random() < 0.1:  # 10% chance of delay change
                updated_train['delay_minutes'] = max(0, train['delay_minutes'] + random.randint(-2, 3))
            updated_trains.append(updated_train)
        
        # Update cache
        cache_manager.update_cache('trains', updated_trains)
        filtered_trains = updated_trains
    
    # Apply filters
    station = request.args.get('station')
    train_type = request.args.get('type')
    status = request.args.get('status')
    
    if station:
        filtered_trains = [train for train in filtered_trains 
                          if station.lower() in train['from_station'].lower() 
                          or station.lower() in train['to_station'].lower()
                          or station.lower() in train['current_station'].lower()]
    
    if train_type:
        filtered_trains = [train for train in filtered_trains 
                          if train_type.lower() in train['type'].lower()]
    
    if status:
        filtered_trains = [train for train in filtered_trains 
                          if train['status'] == status]
    
    # Get last update time
    last_update = cache_manager.get_last_update_time('trains')
    
    return jsonify({
        "success": True,
        "trains": filtered_trains,
        "count": len(filtered_trains),
        "last_updated": last_update,
        "from_cache": cached_data is not None
    })

@app.route('/api/trains/<train_id>', methods=['GET'])
def get_train_details(train_id):
    """Get detailed information about a specific train"""
    # Try to get from cache first
    cached_data = cache_manager.get_cached_data('trains')
    
    if cached_data:
        train_list = cached_data['data']
        last_update = cached_data['last_updated']
    else:
        train_list = trains_data
        last_update = datetime.now().isoformat()
    
    train = next((t for t in train_list if t['id'] == train_id), None)
    
    if not train:
        return jsonify({
            "success": False,
            "error": "Train not found"
        }), 404
    
    return jsonify({
        "success": True,
        "train": train,
        "last_updated": last_update
    })

@app.route('/api/stations', methods=['GET'])
def get_stations():
    """Get all unique stations"""
    # Try to get from cache first
    cached_data = cache_manager.get_cached_data('stations')
    
    if cached_data:
        print("📦 Serving stations from cache")
        stations_list = cached_data['data']
        last_update = cached_data['last_updated']
    else:
        print("🔄 Generating fresh stations data")
        stations = set()
        for train in trains_data:
            stations.add(train['from_station'])
            stations.add(train['to_station'])
            stations.add(train['current_station'])
            for route_stop in train['route']:
                stations.add(route_stop['station'])
        
        stations_list = sorted(list(stations))
        cache_manager.update_cache('stations', stations_list)
        last_update = datetime.now().isoformat()
    
    return jsonify({
        "success": True,
        "stations": stations_list,
        "last_updated": last_update
    })

@app.route('/api/trains/<train_id>/position', methods=['GET'])
def get_train_position(train_id):
    """Get real-time position of a specific train"""
    # Try to get from cache first
    cached_positions = cache_manager.get_cached_data('positions')
    
    if cached_positions and train_id in cached_positions['data']:
        print(f"📦 Serving position for {train_id} from cache")
        position_data = cached_positions['data'][train_id]
        position_data['timestamp'] = cached_positions['last_updated']
        return jsonify(position_data)
    
    # Get train from cached trains or original data
    cached_trains = cache_manager.get_cached_data('trains')
    train_list = cached_trains['data'] if cached_trains else trains_data
    
    train = next((t for t in train_list if t['id'] == train_id), None)
    
    if not train:
        return jsonify({
            "success": False,
            "error": "Train not found"
        }), 404
    
    # Simulate slight position changes for real-time effect
    position = train['position'].copy()
    position['lat'] += random.uniform(-0.01, 0.01)
    position['lng'] += random.uniform(-0.01, 0.01)
    
    position_data = {
        "success": True,
        "train_id": train_id,
        "position": position,
        "current_station": train['current_station'],
        "status": train['status'],
        "delay_minutes": train['delay_minutes'],
        "timestamp": datetime.now().isoformat()
    }
    
    # Update position cache
    if not cached_positions:
        cached_positions = {'data': {}}
    
    cached_positions['data'][train_id] = position_data
    cache_manager.update_cache('positions', cached_positions['data'])
    
    return jsonify(position_data)

@app.route('/api/search', methods=['GET'])
def search_trains():
    """Search trains by various criteria"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Search query is required"
        })
    
    # Get trains from cache or original data
    cached_trains = cache_manager.get_cached_data('trains')
    train_list = cached_trains['data'] if cached_trains else trains_data
    last_update = cached_trains['last_updated'] if cached_trains else datetime.now().isoformat()
    
    results = []
    for train in train_list:
        if (query in train['name'].lower() or 
            query in train['id'].lower() or
            query in train['from_station'].lower() or
            query in train['to_station'].lower() or
            query in train['current_station'].lower()):
            results.append(train)
    
    return jsonify({
        "success": True,
        "results": results,
        "count": len(results),
        "query": query,
        "last_updated": last_update
    })

@app.route('/api/status', methods=['GET'])
def get_system_status():
    """Get system status and statistics"""
    # Try to get from cache first
    cached_status = cache_manager.get_cached_data('status')
    
    if cached_status:
        print("📦 Serving status from cache")
        return jsonify({
            "success": True,
            "status": cached_status['data'],
            "last_updated": cached_status['last_updated']
        })
    
    # Get trains from cache or original data
    cached_trains = cache_manager.get_cached_data('trains')
    train_list = cached_trains['data'] if cached_trains else trains_data
    
    total_trains = len(train_list)
    running_trains = len([t for t in train_list if t['status'] == 'running'])
    delayed_trains = len([t for t in train_list if t['status'] == 'delayed'])
    on_time_trains = len([t for t in train_list if t['delay_minutes'] == 0])
    
    # Get cache info
    cache_info = cache_manager.get_cache_info()
    
    status_data = {
        "total_trains": total_trains,
        "running_trains": running_trains,
        "delayed_trains": delayed_trains,
        "on_time_trains": on_time_trains,
        "system_status": "operational",
        "cache_info": cache_info,
        "last_updated": datetime.now().isoformat()
    }
    
    # Update status cache
    cache_manager.update_cache('status', status_data)
    
    return jsonify({
        "success": True,
        "status": status_data,
        "last_updated": status_data["last_updated"]
    })

# Cache management endpoints
@app.route('/api/cache/info', methods=['GET'])
def get_cache_info():
    """Get information about cache files"""
    return jsonify({
        "success": True,
        "cache_info": cache_manager.get_cache_info()
    })

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear cache files"""
    cache_type = request.json.get('cache_type') if request.json else None
    cache_manager.clear_cache(cache_type)
    
    return jsonify({
        "success": True,
        "message": f"Cache cleared: {cache_type if cache_type else 'all'}"
    })

@app.route('/api/cache/refresh', methods=['POST'])
def refresh_cache():
    """Manually refresh all cache"""
    refresh_all_cache()
    return jsonify({
        "success": True,
        "message": "Cache refreshed successfully"
    })

def refresh_all_cache():
    """Refresh all cache data"""
    print("🔄 Refreshing all cache data...")
    
    # Clear existing cache to force refresh
    cache_manager.last_update.clear()
    
    # Trigger refresh by calling endpoints
    get_trains()
    get_stations()
    get_system_status()
    
    print("✅ All cache refreshed")

def start_background_tasks():
    """Start background tasks like auto-refresh"""
    cache_manager.start_auto_refresh(refresh_all_cache, interval=30)

if __name__ == '__main__':
    print("🚂 Magyar Vonatkövető Backend indítása...")
    print("📦 Cache rendszer inicializálása...")
    
    # Start background tasks
    start_background_tasks()
    
    # Initial cache population
    refresh_all_cache()
    
    print("✅ Backend ready!")
    app.run(debug=True, host='0.0.0.0', port=5000)