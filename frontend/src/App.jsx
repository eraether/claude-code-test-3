import { useState, useEffect } from 'react';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import InsightsView from './components/InsightsView';
import HealthRankingsView from './components/HealthRankingsView';
import TimeSeriesView from './components/TimeSeriesView';
import StateComparisonView from './components/StateComparisonView';
import DataExplorer from './components/DataExplorer';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [topics, setTopics] = useState([]);
  const [states, setStates] = useState([]);
  const [stratifications, setStratifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [topicsData, statesData, stratData] = await Promise.all([
        api.getTopics(),
        api.getStates(),
        api.getStratifications()
      ]);
      setTopics(topicsData);
      setStates(statesData);
      setStratifications(stratData);
      setError(null);
    } catch (err) {
      setError('Failed to load initial data. Please refresh the page.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading data from CDC...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🧠 US Health Intelligence Platform</h1>
          <p>AI-powered analysis & insights from U.S. Chronic Disease data</p>
          <p className="source">
            Data source: <strong>data.gov</strong> | CDC U.S. Chronic Disease Indicators
          </p>
        </div>
      </header>

      <div className="container">
        <div className="card">
          <div className="btn-group">
            <button
              className={`btn ${currentView === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`btn ${currentView === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('insights')}
              style={{ background: currentView === 'insights' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : undefined }}
            >
              🧠 AI Insights
            </button>
            <button
              className={`btn ${currentView === 'rankings' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('rankings')}
            >
              🏆 Health Rankings
            </button>
            <button
              className={`btn ${currentView === 'timeseries' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('timeseries')}
            >
              📈 Time Series
            </button>
            <button
              className={`btn ${currentView === 'comparison' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('comparison')}
            >
              🗺️ State Comparison
            </button>
            <button
              className={`btn ${currentView === 'explorer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('explorer')}
            >
              🔍 Data Explorer
            </button>
          </div>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard topics={topics} states={states} />
        )}

        {currentView === 'insights' && (
          <InsightsView />
        )}

        {currentView === 'rankings' && (
          <HealthRankingsView states={states} />
        )}

        {currentView === 'timeseries' && (
          <TimeSeriesView
            topics={topics}
            states={states}
            stratifications={stratifications}
          />
        )}

        {currentView === 'comparison' && (
          <StateComparisonView
            topics={topics}
            stratifications={stratifications}
          />
        )}

        {currentView === 'explorer' && (
          <DataExplorer
            topics={topics}
            states={states}
            stratifications={stratifications}
          />
        )}
      </div>

      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '40px'
      }}>
        <p>Built with data from <strong>data.gov</strong> - U.S. Government's open data portal</p>
        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
          Data provided by the Centers for Disease Control and Prevention (CDC)
        </p>
      </footer>
    </div>
  );
}

export default App;
