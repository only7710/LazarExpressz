import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Train, MapPin, Clock, X } from 'lucide-react';
import ApiService from '../services/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Kérlek add meg a keresési kifejezést');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const response = await ApiService.searchTrains(query.trim());
      
      if (response.success) {
        setResults(response.results);
        setLastUpdate(response.last_updated);
      } else {
        setError(response.error || 'Hiba történt a keresés során');
      }
    } catch (err) {
      setError('Hiba történt a keresés során');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLastUpdate(null);
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={24} />
          Vonat Keresés
        </h2>

        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Keresési kifejezés
              </label>
              <input
                type="text"
                className="input"
                placeholder="Vonatszám, állomás, útvonal..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                Kereshetsz vonatszám (pl. IC001), állomásnév (pl. Budapest) vagy útvonal alapján
              </div>
            </div>
            
            <button 
              type="submit" 
              className="button"
              disabled={loading || !query.trim()}
              style={{ height: 'fit-content' }}
            >
              <Search size={16} />
              {loading ? 'Keresés...' : 'Keresés'}
            </button>

            {(query || hasSearched) && (
              <button 
                type="button" 
                className="button secondary"
                onClick={clearSearch}
                style={{ height: 'fit-content' }}
              >
                <X size={16} />
                Törlés
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="error">{error}</div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && !error && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '8px'
            }}>
              <h3 style={{ margin: 0 }}>
                Keresési eredmények: "{query}"
              </h3>
              <span style={{ 
                background: '#667eea', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {results.length} találat
              </span>
            </div>

            {results.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#666',
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '8px'
              }}>
                <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h4 style={{ margin: '0 0 8px 0' }}>Nincs találat</h4>
                <p style={{ margin: 0 }}>
                  Próbálj meg másik keresési kifejezést vagy ellenőrizd a helyesírást.
                </p>
              </div>
            ) : (
              <div className="grid grid-2">
                {results.map(train => (
                  <Link 
                    key={train.id} 
                    to={`/trains/${train.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ 
                      padding: '20px', 
                      border: '2px solid rgba(102, 126, 234, 0.2)', 
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.3rem',
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
                        marginBottom: '16px',
                        color: '#333'
                      }}>
                        {train.name}
                      </div>

                      {/* Route */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '12px',
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
                        marginBottom: '12px'
                      }}>
                        <strong>Jelenleg:</strong> {train.current_station}
                      </div>

                      {/* Time and Delay Info */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: '#666',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {train.departure_time} - {train.arrival_time}
                        </div>
                        {train.delay_minutes > 0 && (
                          <div style={{ 
                            color: '#ef4444', 
                            fontWeight: 'bold'
                          }}>
                            +{train.delay_minutes} perc késés
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Last Update Info */}
            {results.length > 0 && lastUpdate && (
              <div style={{ 
                marginTop: '20px',
                padding: '12px',
                background: 'rgba(102, 126, 234, 0.05)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#666',
                textAlign: 'center'
              }}>
                <strong>Adatok frissítve:</strong> {new Date(lastUpdate).toLocaleString('hu-HU')}
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!hasSearched && (
          <div style={{ 
            background: 'rgba(102, 126, 234, 0.05)', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#667eea' }}>Keresési tippek:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
              <li>Keress vonatszám alapján (pl. "IC001", "R001")</li>
              <li>Add meg az állomás nevét (pl. "Budapest", "Debrecen")</li>
              <li>Keress vonat típus alapján (pl. "InterCity", "Regionális")</li>
              <li>Használj részleges neveket is (pl. "Buda" Budapest helyett)</li>
            </ul>
          </div>
        )}
      </div>

      {/* Quick Links */}
      {!hasSearched && (
        <div className="grid grid-2">
          <Link to="/trains" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Train size={32} style={{ color: '#667eea', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px 0' }}>Összes Vonat</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Böngészd az összes elérhető vonat listáját
              </p>
            </div>
          </Link>

          <Link to="/map" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <MapPin size={32} style={{ color: '#667eea', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px 0' }}>Térkép Nézet</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                Tekintsd meg a vonatok pozícióját a térképen
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default SearchPage;