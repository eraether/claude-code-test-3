import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function HealthRankingsView({ states }) {
  const [rankings, setRankings] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [stateScore, setStateScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRankings();
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadStateScore();
    }
  }, [selectedState]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getHealthRankings(2021);
      setRankings(data);
    } catch (err) {
      setError('Failed to load rankings. This may take a moment...');
      console.error('Error loading rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStateScore = async () => {
    try {
      setLoadingState(true);
      const data = await api.getHealthScore(selectedState, 2021);
      setStateScore(data);
    } catch (err) {
      console.error('Error loading state score:', err);
    } finally {
      setLoadingState(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--primary-color)';
    if (score >= 40) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  };

  const getChartData = () => {
    if (!rankings || rankings.length === 0) return null;

    const top15 = rankings.slice(0, 15);

    return {
      labels: top15.map(r => r.state),
      datasets: [
        {
          label: 'Health Score (0-100)',
          data: top15.map(r => r.score),
          backgroundColor: top15.map(r => getScoreColor(r.score)),
          borderColor: top15.map(r => getScoreColor(r.score)),
          borderWidth: 1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top 15 States by Composite Health Score',
        color: '#f1f5f9',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const ranking = rankings[context.dataIndex];
            return [
              `Score: ${context.parsed.x.toFixed(1)}`,
              `Grade: ${getScoreGrade(context.parsed.x)}`,
              `Rank: #${context.dataIndex + 1}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#cbd5e1'
        },
        grid: {
          color: '#334155'
        }
      },
      y: {
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#334155'
        }
      }
    }
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Calculating health scores for all states...</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          This may take 15-30 seconds
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button
          className="btn btn-primary"
          onClick={loadRankings}
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
        <h2 className="card-title">🏆 State Health Rankings</h2>
        <p className="card-subtitle">
          Composite health scores based on multiple indicators including diabetes, obesity, cardiovascular disease, cancer, and more
        </p>

        <div className="stats-grid" style={{ marginTop: '24px' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: getScoreColor(rankings[0]?.score) }}>
              #{1}
            </div>
            <div className="stat-label">Top Ranked</div>
            <div style={{ marginTop: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              {rankings[0]?.name}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: getScoreColor(rankings[0]?.score) }}>
              {rankings[0]?.score.toFixed(1)}
            </div>
            <div className="stat-label">Top Score</div>
            <div style={{ marginTop: '8px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Grade: {getScoreGrade(rankings[0]?.score)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{rankings.length}</div>
            <div className="stat-label">States Analyzed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {(rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length).toFixed(1)}
            </div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      {chartData && (
        <div className="card">
          <div className="chart-container chart-container-large" style={{ height: '500px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Complete Rankings</h3>

        <div className="form-group">
          <label className="form-label">View Detailed Metrics for a State</label>
          <select
            className="form-control"
            value={selectedState || ''}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select a state...</option>
            {rankings.map((r) => (
              <option key={r.state} value={r.state}>
                {r.name} (Score: {r.score.toFixed(1)})
              </option>
            ))}
          </select>
        </div>

        {loadingState && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading state details...</p>
          </div>
        )}

        {stateScore && !loadingState && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'var(--dark-bg)',
            borderRadius: '8px',
            border: '2px solid ' + getScoreColor(stateScore.score)
          }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
              Detailed Health Metrics
            </h4>

            <div className="grid grid-2">
              {stateScore.metrics.diabetes && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Diabetes Prevalence
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--danger-color)' }}>
                    {stateScore.metrics.diabetes.toFixed(1)}%
                  </div>
                </div>
              )}

              {stateScore.metrics.obesity && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Obesity Rate
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--warning-color)' }}>
                    {stateScore.metrics.obesity.toFixed(1)}%
                  </div>
                </div>
              )}

              {stateScore.metrics.smoking && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Smoking Rate
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--danger-color)' }}>
                    {stateScore.metrics.smoking.toFixed(1)}%
                  </div>
                </div>
              )}

              {stateScore.metrics.cancer && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Cancer Mortality
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {stateScore.metrics.cancer.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    per 100,000
                  </div>
                </div>
              )}

              {stateScore.metrics.cvd && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Cardiovascular Mortality
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    {stateScore.metrics.cvd.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    per 100,000
                  </div>
                </div>
              )}

              {stateScore.metrics.exercise && (
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Physical Activity
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--success-color)' }}>
                    {stateScore.metrics.exercise.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="table-container" style={{ marginTop: '24px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>State</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Metrics Analyzed</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking, idx) => (
                <tr key={ranking.state}>
                  <td style={{ fontWeight: '600' }}>#{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{ranking.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {ranking.state}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: getScoreColor(ranking.score) + '20',
                        color: getScoreColor(ranking.score),
                        fontWeight: '600'
                      }}
                    >
                      {ranking.score.toFixed(1)}
                    </div>
                  </td>
                  <td style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: getScoreColor(ranking.score)
                  }}>
                    {getScoreGrade(ranking.score)}
                  </td>
                  <td>{ranking.components} indicators</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
          📊 How Scores Are Calculated
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
          Each state receives a composite health score (0-100) based on multiple weighted factors:
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '24px' }}>
          <li><strong>Obesity rates</strong> (20% weight) - Lower is better</li>
          <li><strong>Diabetes prevalence</strong> (15% weight) - Lower is better</li>
          <li><strong>Smoking rates</strong> (15% weight) - Lower is better</li>
          <li><strong>Cancer mortality</strong> (20% weight) - Lower is better</li>
          <li><strong>Cardiovascular disease mortality</strong> (20% weight) - Lower is better</li>
          <li><strong>Physical activity levels</strong> (10% weight) - Higher is better</li>
        </ul>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px' }}>
          Scores are normalized to account for national averages and provide a relative ranking.
        </p>
      </div>
    </div>
  );
}

export default HealthRankingsView;
