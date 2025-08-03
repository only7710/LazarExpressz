import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Train, Clock, AlertTriangle, CheckCircle, Map, Search } from 'lucide-react';
import ApiService from '../services/api';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [recentTrains, setRecentTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statusData, trainsData] = await Promise.all([
        ApiService.getSystemStatus(),
        ApiService.getTrains()
      ]);
      
      if (statusData.success) {
        setStatus(statusData.status);
      }
      
      if (trainsData.success) {
        setRecentTrains(trainsData.trains.slice(0, 3));
      }
      
      setError(null);
    } catch (err) {
      setError('Hiba történt az adatok betöltésekor');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
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
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Train size={24} />
          Rendszer Állapot
        </h2>
        
        {status && (
          <div className="grid grid-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Összes vonat</div>
                <div style={{ fontSize: '1.5rem', color: '#667eea' }}>{status.total_trains}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Train size={20} style={{ color: '#3b82f6' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Közlekedő vonatok</div>
                <div style={{ fontSize: '1.5rem', color: '#667eea' }}>{status.running_trains}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Késésben</div>
                <div style={{ fontSize: '1.5rem', color: '#ef4444' }}>{status.delayed_trains}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock size={20} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Pontos</div>
                <div style={{ fontSize: '1.5rem', color: '#10b981' }}>{status.on_time_trains}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Aktuális Vonatok</h3>
        <div className="grid grid-2">
          {recentTrains.map(train => (
            <Link 
              key={train.id} 
              to={`/trains/${train.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                padding: '16px', 
                border: '1px solid rgba(0,0,0,0.1)', 
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#667eea' }}>{train.id}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{train.name}</div>
                  </div>
                  <span className={`status-badge status-${train.status}`}>
                    {train.status === 'running' ? 'Közlekedik' : 
                     train.status === 'delayed' ? 'Késés' : train.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                  <strong>{train.from_station}</strong> → <strong>{train.to_station}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Jelenleg: {train.current_station}
                  {train.delay_minutes > 0 && (
                    <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                      +{train.delay_minutes} perc késés
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-2">
        <Link to="/search" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Search size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>Vonat Keresés</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Keress vonatok között szám, útvonal vagy állomás alapján
            </p>
          </div>
        </Link>

        <Link to="/map" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Map size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0' }}>Térkép Nézet</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Tekintsd meg a vonatok valós idejű pozícióját a térképen
            </p>
          </div>
        </Link>
      </div>

      {status && (
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
            Utolsó frissítés: {new Date(status.last_updated).toLocaleString('hu-HU')}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;