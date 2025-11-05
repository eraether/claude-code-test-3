import { useState, useEffect } from 'react';
import { api } from '../services/api';

function InsightsView() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getInsights();
      setInsights(data);
    } catch (err) {
      setError('Failed to load insights. This may take a moment on first load...');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'improvement': return '📈';
      case 'concern': return '⚠️';
      case 'correlation': return '🔗';
      case 'anomaly': return '🎯';
      case 'geographic': return '🗺️';
      case 'prediction': return '🔮';
      default: return '💡';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'improvement': return 'var(--success-color)';
      case 'concern': return 'var(--warning-color)';
      case 'correlation': return 'var(--primary-color)';
      case 'anomaly': return 'var(--secondary-color)';
      case 'geographic': return '#06b6d4';
      case 'prediction': return '#8b5cf6';
      default: return 'var(--text-secondary)';
    }
  };

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.type === filter);

  const categories = [...new Set(insights.map(i => i.category))].filter(Boolean);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Analyzing health data and generating insights...</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          This may take 10-20 seconds on first load
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">
          {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={loadInsights}
          style={{ marginTop: '16px' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">🧠 AI-Generated Health Insights</h2>
        <p className="card-subtitle">
          Intelligent analysis revealing patterns, trends, and predictions in U.S. health data
        </p>

        <div className="stats-grid" style={{ marginTop: '24px', marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-value">{insights.length}</div>
            <div className="stat-label">Total Insights</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {insights.filter(i => i.type === 'correlation').length}
            </div>
            <div className="stat-label">Correlations Found</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {insights.filter(i => i.type === 'anomaly').length}
            </div>
            <div className="stat-label">Anomalies Detected</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {insights.filter(i => i.type === 'prediction').length}
            </div>
            <div className="stat-label">Predictions Made</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">Filter by Type</label>
          <div className="btn-group">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All ({insights.length})
            </button>
            <button
              className={`btn ${filter === 'improvement' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('improvement')}
            >
              📈 Improvements ({insights.filter(i => i.type === 'improvement').length})
            </button>
            <button
              className={`btn ${filter === 'concern' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('concern')}
            >
              ⚠️ Concerns ({insights.filter(i => i.type === 'concern').length})
            </button>
            <button
              className={`btn ${filter === 'correlation' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('correlation')}
            >
              🔗 Correlations ({insights.filter(i => i.type === 'correlation').length})
            </button>
            <button
              className={`btn ${filter === 'anomaly' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('anomaly')}
            >
              🎯 Anomalies ({insights.filter(i => i.type === 'anomaly').length})
            </button>
            <button
              className={`btn ${filter === 'prediction' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('prediction')}
            >
              🔮 Predictions ({insights.filter(i => i.type === 'prediction').length})
            </button>
          </div>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No insights found for this filter</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredInsights.map((insight, idx) => (
            <div key={idx} className="card" style={{
              borderLeft: `4px solid ${getTypeColor(insight.type)}`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '0.85rem',
                padding: '4px 12px',
                background: 'var(--dark-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                Significance: {insight.significance.toFixed(0)}%
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  fontSize: '1.5rem',
                  marginRight: '12px'
                }}>
                  {getTypeIcon(insight.type)}
                </span>
                <span className="badge badge-secondary">
                  {insight.category}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.3rem',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                paddingRight: '100px'
              }}>
                {insight.title}
              </h3>

              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {insight.description}
              </p>

              {insight.data && (
                <details style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'var(--dark-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <summary style={{
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                    userSelect: 'none'
                  }}>
                    View detailed data
                  </summary>
                  <pre style={{
                    marginTop: '12px',
                    fontSize: '0.85rem',
                    overflow: 'auto',
                    color: 'var(--text-muted)'
                  }}>
                    {JSON.stringify(insight.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredInsights.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
            📊 Insights by Category
          </h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {categories.map(category => {
              const count = insights.filter(i => i.category === category).length;
              return (
                <div key={category} style={{
                  padding: '16px',
                  background: 'var(--dark-bg)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--primary-color)',
                    marginBottom: '8px'
                  }}>
                    {count}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px', background: 'rgba(37, 99, 235, 0.1)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
          💡 About These Insights
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          These insights are automatically generated through statistical analysis of CDC health data.
          The system performs correlation analysis, trend detection, anomaly identification, and
          predictive modeling to surface non-obvious patterns and relationships in the data.
          Significance scores indicate the statistical strength and potential impact of each finding.
        </p>
      </div>
    </div>
  );
}

export default InsightsView;
