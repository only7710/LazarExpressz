import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Train, Search, Map, BarChart3, Clock } from 'lucide-react';
import TrainList from './components/TrainList';
import TrainDetails from './components/TrainDetails';
import TrainMap from './components/TrainMap';
import SearchPage from './components/SearchPage';
import Dashboard from './components/Dashboard';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Irányítópult' },
    { path: '/trains', icon: Train, label: 'Vonatok' },
    { path: '/search', icon: Search, label: 'Keresés' },
    { path: '/map', icon: Map, label: 'Térkép' }
  ];

  return (
    <nav style={{ 
      background: 'rgba(255, 255, 255, 0.95)', 
      backdropFilter: 'blur(10px)',
      padding: '1rem 0',
      borderRadius: '16px',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Train size={32} style={{ color: '#667eea' }} />
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Magyar Vonatkövető
            </h1>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`button ${location.pathname === path ? '' : 'secondary'}`}
                style={{ textDecoration: 'none' }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trains" element={<TrainList />} />
            <Route path="/trains/:trainId" element={<TrainDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<TrainMap />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;