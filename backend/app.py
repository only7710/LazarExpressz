from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)

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
    station = request.args.get('station')
    train_type = request.args.get('type')
    status = request.args.get('status')
    
    filtered_trains = trains_data.copy()
    
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
    
    return jsonify({
        "success": True,
        "trains": filtered_trains,
        "count": len(filtered_trains)
    })

@app.route('/api/trains/<train_id>', methods=['GET'])
def get_train_details(train_id):
    """Get detailed information about a specific train"""
    train = next((t for t in trains_data if t['id'] == train_id), None)
    
    if not train:
        return jsonify({
            "success": False,
            "error": "Train not found"
        }), 404
    
    return jsonify({
        "success": True,
        "train": train
    })

@app.route('/api/stations', methods=['GET'])
def get_stations():
    """Get all unique stations"""
    stations = set()
    for train in trains_data:
        stations.add(train['from_station'])
        stations.add(train['to_station'])
        stations.add(train['current_station'])
        for route_stop in train['route']:
            stations.add(route_stop['station'])
    
    return jsonify({
        "success": True,
        "stations": sorted(list(stations))
    })

@app.route('/api/trains/<train_id>/position', methods=['GET'])
def get_train_position(train_id):
    """Get real-time position of a specific train"""
    train = next((t for t in trains_data if t['id'] == train_id), None)
    
    if not train:
        return jsonify({
            "success": False,
            "error": "Train not found"
        }), 404
    
    # Simulate slight position changes for real-time effect
    position = train['position'].copy()
    position['lat'] += random.uniform(-0.01, 0.01)
    position['lng'] += random.uniform(-0.01, 0.01)
    
    return jsonify({
        "success": True,
        "train_id": train_id,
        "position": position,
        "current_station": train['current_station'],
        "status": train['status'],
        "delay_minutes": train['delay_minutes'],
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/search', methods=['GET'])
def search_trains():
    """Search trains by various criteria"""
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Search query is required"
        })
    
    results = []
    for train in trains_data:
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
        "query": query
    })

@app.route('/api/status', methods=['GET'])
def get_system_status():
    """Get system status and statistics"""
    total_trains = len(trains_data)
    running_trains = len([t for t in trains_data if t['status'] == 'running'])
    delayed_trains = len([t for t in trains_data if t['status'] == 'delayed'])
    on_time_trains = len([t for t in trains_data if t['delay_minutes'] == 0])
    
    return jsonify({
        "success": True,
        "status": {
            "total_trains": total_trains,
            "running_trains": running_trains,
            "delayed_trains": delayed_trains,
            "on_time_trains": on_time_trains,
            "system_status": "operational",
            "last_updated": datetime.now().isoformat()
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)