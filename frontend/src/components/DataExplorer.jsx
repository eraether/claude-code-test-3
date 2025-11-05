import { useState } from 'react';
import { api } from '../services/api';

function DataExplorer({ topics, states, stratifications }) {
  const [filters, setFilters] = useState({
    topic: '',
    state: '',
    yearStart: '',
    yearEnd: '',
    stratification: ''
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(0);
      const result = await api.getData(filters);
      setData(result);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data || data.length === 0) return;

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value || '';
        }).join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const paginatedData = data ? data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE) : [];
  const totalPages = data ? Math.ceil(data.length / ITEMS_PER_PAGE) : 0;

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">🔍 Advanced Data Explorer</h2>
        <p className="card-subtitle">
          Filter, search, and export health indicator data
        </p>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">Health Topic</label>
            <select
              className="form-control"
              value={filters.topic}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">State/Territory</label>
            <select
              className="form-control"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              <option value="US">United States (Overall)</option>
              {states.map((state) => (
                <option key={state.abbr} value={state.abbr}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year Start (From)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g., 2010"
              value={filters.yearStart}
              onChange={(e) => handleFilterChange('yearStart', e.target.value)}
              min="2000"
              max="2023"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Year End (To)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g., 2023"
              value={filters.yearEnd}
              onChange={(e) => handleFilterChange('yearEnd', e.target.value)}
              min="2000"
              max="2023"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stratification</label>
            <select
              className="form-control"
              value={filters.stratification}
              onChange={(e) => handleFilterChange('stratification', e.target.value)}
            >
              <option value="">All Categories</option>
              {stratifications.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '16px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : '🔍 Search Data'}
          </button>
          {data && data.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleExport}
            >
              📥 Export to CSV
            </button>
          )}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && data && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <span className="badge">
                  {data.length} records found
                </span>
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{ padding: '8px 16px' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    style={{ padding: '8px 16px' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {paginatedData.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Location</th>
                      <th>Topic</th>
                      <th>Question</th>
                      <th>Stratification</th>
                      <th>Value</th>
                      <th>Data Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.yearstart || 'N/A'}</td>
                        <td>
                          <div style={{ fontWeight: '500' }}>
                            {row.locationabbr}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {row.locationdesc}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">
                            {row.topic}
                          </span>
                        </td>
                        <td style={{ maxWidth: '300px' }}>
                          {row.question}
                        </td>
                        <td>
                          {row.stratificationcategory1 && (
                            <div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {row.stratificationcategory1}
                              </div>
                              <div>{row.stratification1}</div>
                            </div>
                          )}
                        </td>
                        <td>
                          {row.datavalue ? (
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {parseFloat(row.datavalue).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {row.datavalueunit}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {row.datasource}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No data found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {!loading && !data && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>Configure your filters and click "Search Data" to explore the dataset</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataExplorer;
