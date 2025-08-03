import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Train, Filter, RefreshCw, MapPin, Clock } from 'lucide-react';
import ApiService from '../services/api';

function TrainList() {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    station: '',
    type: '',
    status: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trains, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trainsData, stationsData] = await Promise.all([
        ApiService.getTrains(),
        ApiService.getStations()
      ]);
      
      if (trainsData.success) {
        setTrains(trainsData.trains);
      }
      
      if (stationsData.success) {
        setStations(stationsData.stations);
      }
      
      setError(null);
    } catch (err) {
      setError('Hiba történt az adatok betöltésekor');
      console.error('TrainList error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trains];

    if (filters.station) {
      filtered = filtered.filter(train => 
        train.from_station.toLowerCase().includes(filters.station.toLowerCase()) ||
        train.to_station.toLowerCase().includes(filters.station.toLowerCase()) ||
        train.current_station.toLowerCase().includes(filters.station.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(train => 
        train.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(train => train.status === filters.status);
    }

    setFilteredTrains(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ station: '', type: '', status: '' });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Train size={24} />
            Vonatok ({filteredTrains.length})
          </h2>
          <button 
            className="button" 
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Frissítés
          </button>
        </div>

        {/* Filters */}
        <div className="card" style={{ background: 'rgba(102, 126, 234, 0.05)', margin: '0 0 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Filter size={20} />
            <h3 style={{ margin: 0 }}>Szűrők</h3>
            {(filters.station || filters.type || filters.status) && (
              <button 
                className="button secondary" 
                onClick={clearFilters}
                style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px' }}
              >
                Törlés
              </button>
            )}
          </div>
          
          <div className="grid grid-3">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Állomás
              </label>
              <input
                type="text"
                className="input"
                placeholder="Állomás neve..."
                value={filters.station}
                onChange={(e) => handleFilterChange('station', e.target.value)}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Típus
              </label>
              <select
                className="input"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Minden típus</option>
                <option value="InterCity">InterCity</option>
                <option value="Sebesvonat">Sebesvonat</option>
                <option value="Regionális">Regionális</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Állapot
              </label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Minden állapot</option>
                <option value="running">Közlekedik</option>
                <option value="delayed">Késésben</option>
              </select>
            </div>
          </div>
        </div>

        {/* Train List */}
        <div className="grid grid-2">
          {filteredTrains.map(train => (
            <Link 
              key={train.id} 
              to={`/trains/${train.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                padding: '20px', 
                border: '1px solid rgba(0,0,0,0.1)', 
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.9)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.2rem',
                      color: '#667eea',
                      marginBottom: '4px'
                    }}>
                      {train.id}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      {train.type}
                    </div>
                  </div>
                  <span className={`status-badge status-${train.status}`}>
                    {train.status === 'running' ? 'Közlekedik' : 
                     train.status === 'delayed' ? 'Késés' : train.status}
                  </span>
                </div>

                {/* Train Name */}
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#333'
                }}>
                  {train.name}
                </div>

                {/* Route */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '0.95rem'
                }}>
                  <MapPin size={16} style={{ color: '#667eea' }} />
                  <strong>{train.from_station}</strong> 
                  <span style={{ color: '#666' }}>→</span> 
                  <strong>{train.to_station}</strong>
                </div>

                {/* Current Status */}
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  <strong>Jelenleg:</strong> {train.current_station}
                </div>

                {/* Time and Delay Info */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: '#666'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {train.departure_time} - {train.arrival_time}
                  </div>
                  {train.delay_minutes > 0 && (
                    <div style={{ 
                      color: '#ef4444', 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      +{train.delay_minutes} perc késés
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredTrains.length === 0 && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            <Train size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>Nincs megjeleníthető vonat a jelenlegi szűrőkkel.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainList;