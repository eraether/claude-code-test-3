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

function StateComparisonView({ topics, stratifications }) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedYear, setSelectedYear] = useState('2021');
  const [selectedStratification, setSelectedStratification] = useState('Overall');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions();
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedTopic && selectedQuestion && selectedYear) {
      loadComparisonData();
    }
  }, [selectedTopic, selectedQuestion, selectedYear, selectedStratification]);

  const loadQuestions = async () => {
    try {
      const data = await api.getQuestions(selectedTopic);
      setQuestions(data);
      setSelectedQuestion(data[0] || '');
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStateComparison(
        selectedTopic,
        selectedQuestion,
        selectedYear,
        selectedStratification
      );
      setComparisonData(data);
    } catch (err) {
      setError('Failed to load comparison data');
      console.error('Error loading comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedData = () => {
    if (!comparisonData) return null;
    const sorted = [...comparisonData];
    sorted.sort((a, b) => sortOrder === 'desc' ? b.value - a.value : a.value - b.value);
    return sorted;
  };

  const getChartData = () => {
    const sortedData = getSortedData();
    if (!sortedData || sortedData.length === 0) return null;

    // Show top 20 states
    const topStates = sortedData.slice(0, 20);

    return {
      labels: topStates.map(d => d.state),
      datasets: [
        {
          label: topStates[0]?.unit || 'Value',
          data: topStates.map(d => d.value),
          backgroundColor: 'rgba(37, 99, 235, 0.8)',
          borderColor: 'rgb(37, 99, 235)',
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
        display: true,
        labels: {
          color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: `State Comparison - ${selectedYear}`,
        color: '#f1f5f9',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = getSortedData()[context.dataIndex];
            return `${dataPoint.stateName}: ${context.parsed.x.toFixed(2)} ${dataPoint.unit}`;
          }
        }
      }
    },
    scales: {
      x: {
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
            size: 11
          }
        },
        grid: {
          color: '#334155'
        }
      }
    }
  };

  const chartData = getChartData();
  const sortedData = getSortedData();

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">🗺️ State-by-State Comparison</h2>
        <p className="card-subtitle">
          Compare health indicators across all U.S. states and territories
        </p>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Select Health Topic</label>
            <select
              className="form-control"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">Choose a topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Year</label>
            <select
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 15 }, (_, i) => 2023 - i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Indicator</label>
            <select
              className="form-control"
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              disabled={!selectedTopic}
            >
              <option value="">Choose an indicator...</option>
              {questions.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Stratification</label>
            <select
              className="form-control"
              value={selectedStratification}
              onChange={(e) => setSelectedStratification(e.target.value)}
            >
              {stratifications.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && chartData && sortedData.length > 0 && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sort order:</span>
              <button
                className={`btn ${sortOrder === 'desc' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSortOrder('desc')}
              >
                Highest First
              </button>
              <button
                className={`btn ${sortOrder === 'asc' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSortOrder('asc')}
              >
                Lowest First
              </button>
            </div>

            <div className="chart-container chart-container-large" style={{ height: '600px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.max(...sortedData.map(d => d.value)).toFixed(2)}
                  </div>
                  <div className="stat-label">Highest Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.min(...sortedData.map(d => d.value)).toFixed(2)}
                  </div>
                  <div className="stat-label">Lowest Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(sortedData.reduce((sum, d) => sum + d.value, 0) / sortedData.length).toFixed(2)}
                  </div>
                  <div className="stat-label">National Average</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{sortedData.length}</div>
                  <div className="stat-label">States/Territories</div>
                </div>
              </div>

              <div className="table-container" style={{ marginTop: '24px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>State</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((d, idx) => (
                      <tr key={d.state}>
                        <td>#{idx + 1}</td>
                        <td>{d.stateName}</td>
                        <td>
                          {d.value.toFixed(2)} {d.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !selectedTopic && (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <p>Select a health topic to begin comparing states</p>
          </div>
        )}

        {!loading && !error && sortedData && sortedData.length === 0 && selectedTopic && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No data available for the selected criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StateComparisonView;
