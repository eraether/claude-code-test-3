import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TimeSeriesView({ topics, states, stratifications }) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedState, setSelectedState] = useState('US');
  const [selectedStratification, setSelectedStratification] = useState('Overall');
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedTopic) {
      loadQuestions();
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedTopic && selectedQuestion) {
      loadTimeSeriesData();
    }
  }, [selectedTopic, selectedQuestion, selectedState, selectedStratification]);

  const loadQuestions = async () => {
    try {
      const data = await api.getQuestions(selectedTopic);
      setQuestions(data);
      setSelectedQuestion(data[0] || '');
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadTimeSeriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTimeSeries(
        selectedTopic,
        selectedQuestion,
        selectedState,
        selectedStratification
      );
      setTimeSeriesData(data);
    } catch (err) {
      setError('Failed to load time series data');
      console.error('Error loading time series:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!timeSeriesData || timeSeriesData.length === 0) return null;

    return {
      labels: timeSeriesData.map(d => d.year),
      datasets: [
        {
          label: timeSeriesData[0]?.unit || 'Value',
          data: timeSeriesData.map(d => d.value),
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#cbd5e1'
        }
      },
      title: {
        display: true,
        text: selectedQuestion || 'Time Series Analysis',
        color: '#f1f5f9',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toFixed(2);
            const dataPoint = timeSeriesData[context.dataIndex];
            if (dataPoint.lowCI && dataPoint.highCI) {
              label += ` (CI: ${dataPoint.lowCI.toFixed(2)} - ${dataPoint.highCI.toFixed(2)})`;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#cbd5e1'
        },
        grid: {
          color: '#334155'
        }
      },
      x: {
        ticks: {
          color: '#cbd5e1'
        },
        grid: {
          color: '#334155'
        }
      }
    }
  };

  const chartData = getChartData();

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">📈 Time Series Analysis</h2>
        <p className="card-subtitle">
          Track health indicators over time and analyze trends
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
            <label className="form-label">Select State/Territory</label>
            <select
              className="form-control"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="US">United States (Overall)</option>
              {states.map((state) => (
                <option key={state.abbr} value={state.abbr}>
                  {state.name}
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

        {!loading && !error && chartData && timeSeriesData.length > 0 && (
          <div>
            <div className="chart-container chart-container-large">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Data Summary</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.max(...timeSeriesData.map(d => d.value)).toFixed(2)}
                  </div>
                  <div className="stat-label">Maximum Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {Math.min(...timeSeriesData.map(d => d.value)).toFixed(2)}
                  </div>
                  <div className="stat-label">Minimum Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(timeSeriesData.reduce((sum, d) => sum + d.value, 0) / timeSeriesData.length).toFixed(2)}
                  </div>
                  <div className="stat-label">Average Value</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{timeSeriesData.length}</div>
                  <div className="stat-label">Data Points</div>
                </div>
              </div>

              <div className="table-container" style={{ marginTop: '24px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Value</th>
                      <th>Low CI</th>
                      <th>High CI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeSeriesData.map((d, idx) => (
                      <tr key={idx}>
                        <td>{d.year}</td>
                        <td>{d.value.toFixed(2)} {d.unit}</td>
                        <td>{d.lowCI ? d.lowCI.toFixed(2) : 'N/A'}</td>
                        <td>{d.highCI ? d.highCI.toFixed(2) : 'N/A'}</td>
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
            <div className="empty-state-icon">📊</div>
            <p>Select a health topic to begin exploring time series data</p>
          </div>
        )}

        {!loading && !error && timeSeriesData && timeSeriesData.length === 0 && selectedTopic && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No data available for the selected criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeSeriesView;
