import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Train, MapPin, Clock, AlertTriangle, ArrowLeft, RefreshCw, Navigation } from 'lucide-react';
import ApiService from '../services/api';

function TrainDetails() {
  const { trainId } = useParams();
  const [train, setTrain] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrainData();
    const interval = setInterval(loadPosition, 10000); // Update position every 10 seconds
    return () => clearInterval(interval);
  }, [trainId]);

  const loadTrainData = async () => {
    try {
      setLoading(true);
      const [trainData, positionData] = await Promise.all([
        ApiService.getTrainDetails(trainId),
        ApiService.getTrainPosition(trainId)
      ]);
      
      if (trainData.success) {
        setTrain(trainData.train);
      }
      
      if (positionData.success) {
        setPosition(positionData);
      }
      
      setError(null);
    } catch (err) {
      setError('Hiba történt az adatok betöltésekor');
      console.error('TrainDetails error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPosition = async () => {
    try {
      const positionData = await ApiService.getTrainPosition(trainId);
      if (positionData.success) {
        setPosition(positionData);
      }
    } catch (err) {
      console.error('Position update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link to="/trains" className="button secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} />
          Vissza a vonatokhoz
        </Link>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!train) {
    return (
      <div>
        <Link to="/trains" className="button secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} />
          Vissza a vonatokhoz
        </Link>
        <div className="error">Vonat nem található</div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/trains" className="button secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} />
        Vissza a vonatokhoz
      </Link>

      {/* Train Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Train size={28} style={{ color: '#667eea' }} />
              <h1 style={{ 
                margin: 0, 
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {train.id}
              </h1>
              <span className={`status-badge status-${train.status}`}>
                {train.status === 'running' ? 'Közlekedik' : 
                 train.status === 'delayed' ? 'Késés' : train.status}
              </span>
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>{train.name}</h2>
            <div style={{ color: '#666', fontSize: '1.1rem' }}>{train.type}</div>
          </div>
          
          <button 
            className="button" 
            onClick={loadTrainData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Frissítés
          </button>
        </div>

        {/* Route Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          fontSize: '1.2rem',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} style={{ color: '#667eea' }} />
            <strong>{train.from_station}</strong>
          </div>
          <div style={{ 
            flex: 1, 
            height: '2px', 
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: '1px'
          }}></div>
          <div><strong>{train.to_station}</strong></div>
        </div>

        {/* Time and Delay */}
        <div className="grid grid-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: '#667eea' }} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Indulás - Érkezés</div>
              <div style={{ fontSize: '1.1rem' }}>{train.departure_time} - {train.arrival_time}</div>
            </div>
          </div>
          
          {train.delay_minutes > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: 'bold', color: '#ef4444' }}>Késés</div>
                <div style={{ fontSize: '1.1rem', color: '#ef4444' }}>
                  +{train.delay_minutes} perc
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Position */}
      {position && (
        <div className="card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} />
            Jelenlegi Pozíció
          </h3>
          <div className="grid grid-2">
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Állomás</div>
              <div style={{ fontSize: '1.1rem' }}>{position.current_station}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Koordináták</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {position.position.lat.toFixed(4)}, {position.position.lng.toFixed(4)}
              </div>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#666', 
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Pozíció frissítve:</strong> {new Date(position.timestamp).toLocaleString('hu-HU')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }}></div>
              <span>Valós idejű</span>
            </div>
          </div>
        </div>
      )}

      {/* Route Details */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Útvonal</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {train.route.map((stop, index) => (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: stop.status === 'current' ? 'rgba(102, 126, 234, 0.1)' : 
                           stop.status === 'departed' ? 'rgba(16, 185, 129, 0.1)' : 
                           'rgba(107, 114, 128, 0.1)'
              }}
            >
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%',
                background: stop.status === 'current' ? '#667eea' : 
                           stop.status === 'departed' ? '#10b981' : '#6b7280'
              }}></div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: stop.status === 'current' ? 'bold' : 'normal',
                  fontSize: '1.1rem'
                }}>
                  {stop.station}
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666'
                }}>
                  {stop.time}
                </div>
              </div>
              
              <div style={{ 
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: 'white',
                background: stop.status === 'current' ? '#667eea' : 
                           stop.status === 'departed' ? '#10b981' : '#6b7280'
              }}>
                {stop.status === 'current' ? 'Jelenleg itt' : 
                 stop.status === 'departed' ? 'Elindult' : 'Következő'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-2">
        <Link to="/map" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <MapPin size={32} style={{ color: '#667eea', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0' }}>Térkép Nézet</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              Tekintsd meg a vonat pozícióját a térképen
            </p>
          </div>
        </Link>

        <Link to="/trains" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Train size={32} style={{ color: '#667eea', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 8px 0' }}>Összes Vonat</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              Böngészd a többi vonat információit
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default TrainDetails;