import { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard({ topics, states }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{topics.length}</div>
          <div className="stat-label">Health Topics</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{states.length}</div>
          <div className="stat-label">States & Territories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {summary?.yearRange?.max - summary?.yearRange?.min || 0}+
          </div>
          <div className="stat-label">Years of Data</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">115</div>
          <div className="stat-label">Health Indicators</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Welcome to the US Health Insights Dashboard</h2>
        <p className="card-subtitle" style={{ marginBottom: '20px' }}>
          This interactive platform allows you to explore comprehensive chronic disease data
          from the Centers for Disease Control and Prevention (CDC), sourced directly from data.gov.
        </p>

        <div className="grid">
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--primary-color)' }}>
              📈 Time Series Analysis
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Track health indicators over time. View trends, compare different periods, and
              analyze how health outcomes have evolved across years.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--primary-color)' }}>
              🗺️ State-by-State Comparison
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Compare health metrics across all 50 states and territories. Identify regional
              patterns and understand geographic variations in health outcomes.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--primary-color)' }}>
              🔍 Advanced Data Explorer
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Deep dive into the data with powerful filtering and search capabilities. Export
              data for your own analysis and research.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Available Health Topics</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {topics.slice(0, 12).map((topic) => (
            <div
              key={topic}
              style={{
                padding: '16px',
                background: 'var(--dark-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {topic}
              </div>
            </div>
          ))}
        </div>
        {topics.length > 12 && (
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>
            And {topics.length - 12} more topics...
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">About the Data</h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '12px' }}>
            The <strong>U.S. Chronic Disease Indicators (CDI)</strong> is a set of 115 indicators
            that were developed by consensus among the Centers for Disease Control and Prevention (CDC),
            the Council of State and Territorial Epidemiologists (CSTE), and the National Association
            of Chronic Disease Directors (NACDD).
          </p>
          <p style={{ marginBottom: '12px' }}>
            CDI enables public health professionals and policymakers to retrieve uniformly defined state
            and territory-level data for chronic diseases and risk factors that have a substantial impact
            on public health.
          </p>
          <p>
            <strong>Data Coverage:</strong> {summary?.yearRange?.min} - {summary?.yearRange?.max}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
