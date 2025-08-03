import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map, Train, RefreshCw, Info } from 'lucide-react';
import L from 'leaflet';
import ApiService from '../services/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom train icon
const trainIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#667eea" stroke="white" stroke-width="2"/>
      <path d="M6 14h12v2H6z" fill="white"/>
      <path d="M8 10h8v2H8z" fill="white"/>
      <circle cx="9" cy="16" r="1" fill="white"/>
      <circle cx="15" cy="16" r="1" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const delayedTrainIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
      <path d="M6 14h12v2H6z" fill="white"/>
      <path d="M8 10h8v2H8z" fill="white"/>
      <circle cx="9" cy="16" r="1" fill="white"/>
      <circle cx="15" cy="16" r="1" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function TrainMap() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadTrains();
    const interval = setInterval(loadTrains, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTrains = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getTrains();
      
      if (response.success) {
        // Get positions for all trains
        const trainsWithPositions = await Promise.all(
          response.trains.map(async (train) => {
            try {
              const positionData = await ApiService.getTrainPosition(train.id);
              return {
                ...train,
                realTimePosition: positionData.success ? positionData.position : train.position
              };
            } catch (err) {
              console.error(`Error getting position for train ${train.id}:`, err);
              return { ...train, realTimePosition: train.position };
            }
          })
        );
        setTrains(trainsWithPositions);
        setLastUpdate(response.last_updated);
      }
      
      setError(null);
    } catch (err) {
      setError('Hiba történt az adatok betöltésekor');
      console.error('TrainMap error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Center map on Hungary
  const mapCenter = [47.1625, 19.5033]; // Budapest coordinates
  const mapZoom = 7;

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="button" onClick={loadTrains} style={{ marginTop: '16px' }}>
          <RefreshCw size={16} />
          Újrapróbálás
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Map size={24} />
            Vonatok Térképe
          </h2>
          <button 
            className="button" 
            onClick={loadTrains}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? 'Frissítés...' : 'Frissítés'}
          </button>
        </div>

        {/* Map Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '20px',
          padding: '12px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: '#667eea',
              border: '2px solid white'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Pontos vonatok</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: '#ef4444',
              border: '2px solid white'
            }}></div>
            <span style={{ fontSize: '0.9rem' }}>Késésben lévő vonatok</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '0.9rem' }}>Kattints a vonatra a részletekért</span>
          </div>
        </div>

        {/* Map Container */}
        <div style={{ 
          height: '500px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {loading ? (
            <div className="loading" style={{ height: '100%' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {trains.map(train => (
                <Marker
                  key={train.id}
                  position={[train.realTimePosition.lat, train.realTimePosition.lng]}
                  icon={train.delay_minutes > 0 ? delayedTrainIcon : trainIcon}
                  eventHandlers={{
                    click: () => setSelectedTrain(train)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ color: '#667eea', fontSize: '1.1rem' }}>
                          {train.id}
                        </strong>
                        <span className={`status-badge status-${train.status}`} style={{ fontSize: '0.7rem' }}>
                          {train.status === 'running' ? 'Közlekedik' : 
                           train.status === 'delayed' ? 'Késés' : train.status}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                        {train.name}
                      </div>
                      
                      <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                        <strong>{train.from_station}</strong> → <strong>{train.to_station}</strong>
                      </div>
                      
                      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                        Jelenleg: <strong>{train.current_station}</strong>
                      </div>
                      
                      {train.delay_minutes > 0 && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#ef4444', 
                          fontWeight: 'bold',
                          marginBottom: '8px'
                        }}>
                          +{train.delay_minutes} perc késés
                        </div>
                      )}
                      
                      <Link 
                        to={`/trains/${train.id}`}
                        style={{ 
                          display: 'inline-block',
                          padding: '6px 12px',
                          background: '#667eea',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Részletek
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Train List Sidebar */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>
          Vonatok Listája ({trains.length})
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gap: '12px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {trains.map(train => (
            <div 
              key={train.id}
              style={{ 
                padding: '12px',
                border: selectedTrain?.id === train.id ? '2px solid #667eea' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedTrain?.id === train.id ? 'rgba(102, 126, 234, 0.05)' : 'transparent'
              }}
              onClick={() => setSelectedTrain(train)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#667eea' }}>{train.id}</div>
                <span className={`status-badge status-${train.status}`} style={{ fontSize: '0.7rem' }}>
                  {train.status === 'running' ? 'Közlekedik' : 
                   train.status === 'delayed' ? 'Késés' : train.status}
                </span>
              </div>
              
              <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                {train.from_station} → {train.to_station}
              </div>
              
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                Jelenleg: {train.current_station}
                {train.delay_minutes > 0 && (
                  <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                    +{train.delay_minutes} perc
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Train Details */}
      {selectedTrain && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Train size={20} />
            {selectedTrain.id} - Részletek
          </h3>
          
          <div className="grid grid-2">
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Vonat név</div>
              <div style={{ marginBottom: '12px' }}>{selectedTrain.name}</div>
              
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Típus</div>
              <div style={{ marginBottom: '12px' }}>{selectedTrain.type}</div>
              
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Útvonal</div>
              <div style={{ marginBottom: '12px' }}>
                {selectedTrain.from_station} → {selectedTrain.to_station}
              </div>
            </div>
            
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Jelenlegi állomás</div>
              <div style={{ marginBottom: '12px' }}>{selectedTrain.current_station}</div>
              
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Menetrend</div>
              <div style={{ marginBottom: '12px' }}>
                {selectedTrain.departure_time} - {selectedTrain.arrival_time}
              </div>
              
              {selectedTrain.delay_minutes > 0 && (
                <>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#ef4444' }}>Késés</div>
                  <div style={{ marginBottom: '12px', color: '#ef4444' }}>
                    +{selectedTrain.delay_minutes} perc
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <Link 
              to={`/trains/${selectedTrain.id}`}
              className="button"
            >
              Teljes részletek megtekintése
            </Link>
          </div>
        </div>
      )}

      {/* Last Update Info */}
      {!loading && trains.length > 0 && lastUpdate && (
        <div className="card">
          <div style={{ 
            fontSize: '0.8rem',
            color: '#666',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Térkép adatok frissítve:</strong> {new Date(lastUpdate).toLocaleString('hu-HU')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }}></div>
              <span>Automatikus frissítés: 15mp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainMap;