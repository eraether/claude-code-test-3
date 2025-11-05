import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Get all available topics
  getTopics: async () => {
    const response = await axios.get(`${API_BASE}/topics`);
    return response.data;
  },

  // Get all states
  getStates: async () => {
    const response = await axios.get(`${API_BASE}/states`);
    return response.data;
  },

  // Get questions for a topic
  getQuestions: async (topic) => {
    const response = await axios.get(`${API_BASE}/questions/${encodeURIComponent(topic)}`);
    return response.data;
  },

  // Get stratification categories
  getStratifications: async () => {
    const response = await axios.get(`${API_BASE}/stratifications`);
    return response.data;
  },

  // Get filtered data
  getData: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await axios.get(`${API_BASE}/data?${params}`);
    return response.data;
  },

  // Get time series data
  getTimeSeries: async (topic, question, state = 'US', stratification = 'Overall') => {
    const params = new URLSearchParams({
      topic,
      question,
      state,
      stratification
    });
    const response = await axios.get(`${API_BASE}/timeseries?${params}`);
    return response.data;
  },

  // Get state comparison
  getStateComparison: async (topic, question, year, stratification = 'Overall') => {
    const params = new URLSearchParams({
      topic,
      question,
      year,
      stratification
    });
    const response = await axios.get(`${API_BASE}/state-comparison?${params}`);
    return response.data;
  },

  // Get summary statistics
  getSummary: async () => {
    const response = await axios.get(`${API_BASE}/summary`);
    return response.data;
  },

  // ===== INTELLIGENT ANALYSIS =====

  // Get AI-generated insights
  getInsights: async () => {
    const response = await axios.get(`${API_BASE}/insights`);
    return response.data;
  },

  // Get health rankings
  getHealthRankings: async (year = 2021) => {
    const response = await axios.get(`${API_BASE}/health-rankings?year=${year}`);
    return response.data;
  },

  // Get health score for a state
  getHealthScore: async (state, year = 2021) => {
    const response = await axios.get(`${API_BASE}/health-score/${state}?year=${year}`);
    return response.data;
  }
};
