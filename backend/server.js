const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const analysisEngine = require('./analysis-engine');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

// Middleware
app.use(cors());
app.use(express.json());

// CDC API base URL
const CDC_API_BASE = 'https://data.cdc.gov/resource/hksd-2xuw.json';

// Helper function to build query string
function buildQueryString(params) {
  const query = [];

  if (params.topic) {
    query.push(`topic='${params.topic}'`);
  }

  if (params.state) {
    query.push(`locationabbr='${params.state}'`);
  }

  if (params.yearStart) {
    query.push(`yearstart>=${params.yearStart}`);
  }

  if (params.yearEnd) {
    query.push(`yearend<=${params.yearEnd}`);
  }

  if (params.question) {
    query.push(`question='${params.question}'`);
  }

  if (params.stratification) {
    query.push(`stratificationcategory1='${params.stratification}'`);
  }

  return query.length > 0 ? `$where=${query.join(' AND ')}` : '';
}

// API Routes

// Get all available topics
app.get('/api/topics', async (req, res) => {
  try {
    const cacheKey = 'topics';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(`${CDC_API_BASE}?$select=distinct topic&$limit=1000`);
    const topics = [...new Set(response.data.map(item => item.topic))].filter(Boolean).sort();

    cache.set(cacheKey, topics);
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error.message);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get all available states
app.get('/api/states', async (req, res) => {
  try {
    const cacheKey = 'states';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(`${CDC_API_BASE}?$select=locationabbr,locationdesc&$group=locationabbr,locationdesc&$limit=100`);
    const states = response.data
      .filter(item => item.locationabbr && item.locationdesc)
      .map(item => ({
        abbr: item.locationabbr,
        name: item.locationdesc
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    cache.set(cacheKey, states);
    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error.message);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});

// Get questions for a topic
app.get('/api/questions/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const cacheKey = `questions_${topic}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(
      `${CDC_API_BASE}?$select=distinct question&$where=topic='${topic}'&$limit=1000`
    );
    const questions = [...new Set(response.data.map(item => item.question))].filter(Boolean).sort();

    cache.set(cacheKey, questions);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error.message);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get stratification categories
app.get('/api/stratifications', async (req, res) => {
  try {
    const cacheKey = 'stratifications';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const response = await axios.get(`${CDC_API_BASE}?$select=distinct stratificationcategory1&$limit=1000`);
    const stratifications = [...new Set(response.data.map(item => item.stratificationcategory1))]
      .filter(Boolean)
      .sort();

    cache.set(cacheKey, stratifications);
    res.json(stratifications);
  } catch (error) {
    console.error('Error fetching stratifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch stratifications' });
  }
});

// Get data with filters
app.get('/api/data', async (req, res) => {
  try {
    const { topic, state, yearStart, yearEnd, question, stratification, limit = 5000 } = req.query;

    const cacheKey = JSON.stringify(req.query);
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const whereClause = buildQueryString({ topic, state, yearStart, yearEnd, question, stratification });
    const url = `${CDC_API_BASE}?${whereClause}&$limit=${limit}`;

    console.log('Fetching data from:', url);

    const response = await axios.get(url);
    const data = response.data;

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get time series data for a specific indicator
app.get('/api/timeseries', async (req, res) => {
  try {
    const { topic, question, state = 'US', stratification = 'Overall' } = req.query;

    if (!topic || !question) {
      return res.status(400).json({ error: 'Topic and question are required' });
    }

    const cacheKey = `timeseries_${topic}_${question}_${state}_${stratification}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const whereClause = [
      `topic='${topic}'`,
      `question='${question}'`,
      `locationabbr='${state}'`,
      `stratification1='${stratification}'`
    ].join(' AND ');

    const url = `${CDC_API_BASE}?$where=${whereClause}&$order=yearstart&$limit=1000`;

    const response = await axios.get(url);
    const data = response.data
      .filter(item => item.datavalue && item.yearstart)
      .map(item => ({
        year: item.yearstart,
        value: parseFloat(item.datavalue),
        unit: item.datavalueunit,
        lowCI: item.lowconfidencelimit ? parseFloat(item.lowconfidencelimit) : null,
        highCI: item.highconfidencelimit ? parseFloat(item.highconfidencelimit) : null
      }))
      .sort((a, b) => a.year - b.year);

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching time series:', error.message);
    res.status(500).json({ error: 'Failed to fetch time series data' });
  }
});

// Get state comparison data
app.get('/api/state-comparison', async (req, res) => {
  try {
    const { topic, question, year, stratification = 'Overall' } = req.query;

    if (!topic || !question || !year) {
      return res.status(400).json({ error: 'Topic, question, and year are required' });
    }

    const cacheKey = `statecomp_${topic}_${question}_${year}_${stratification}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const whereClause = [
      `topic='${topic}'`,
      `question='${question}'`,
      `yearstart=${year}`,
      `stratification1='${stratification}'`
    ].join(' AND ');

    const url = `${CDC_API_BASE}?$where=${whereClause}&$limit=1000`;

    const response = await axios.get(url);
    const data = response.data
      .filter(item => item.datavalue && item.locationabbr && item.locationabbr !== 'US')
      .map(item => ({
        state: item.locationabbr,
        stateName: item.locationdesc,
        value: parseFloat(item.datavalue),
        unit: item.datavalueunit,
        geolocation: item.geolocation
      }))
      .sort((a, b) => b.value - a.value);

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching state comparison:', error.message);
    res.status(500).json({ error: 'Failed to fetch state comparison data' });
  }
});

// Get summary statistics
app.get('/api/summary', async (req, res) => {
  try {
    const cacheKey = 'summary';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const [topicsResp, statesResp, yearsResp] = await Promise.all([
      axios.get(`${CDC_API_BASE}?$select=count(distinct topic) as topic_count`),
      axios.get(`${CDC_API_BASE}?$select=count(distinct locationabbr) as state_count`),
      axios.get(`${CDC_API_BASE}?$select=min(yearstart) as min_year, max(yearend) as max_year`)
    ]);

    const summary = {
      totalTopics: topicsResp.data[0]?.topic_count || 0,
      totalStates: statesResp.data[0]?.state_count || 0,
      yearRange: {
        min: yearsResp.data[0]?.min_year || 0,
        max: yearsResp.data[0]?.max_year || 0
      }
    };

    cache.set(cacheKey, summary);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error.message);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ============================================
// INTELLIGENT ANALYSIS ENDPOINTS
// ============================================

// Get AI-generated insights
app.get('/api/insights', async (req, res) => {
  try {
    console.log('Generating intelligent insights...');
    const insights = await analysisEngine.generateInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error generating insights:', error.message);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get health rankings for all states
app.get('/api/health-rankings', async (req, res) => {
  try {
    const { year = 2021 } = req.query;
    const cacheKey = `rankings_${year}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    console.log(`Calculating health rankings for ${year}...`);
    const result = await analysisEngine.getHealthRankings(parseInt(year));

    cache.set(cacheKey, result, 7200); // Cache for 2 hours
    res.json(result);
  } catch (error) {
    console.error('Error calculating health rankings:', error.message);
    res.status(500).json({ error: 'Failed to calculate health rankings' });
  }
});

// Get health score for a specific state
app.get('/api/health-score/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const { year = 2021 } = req.query;

    const cacheKey = `score_${state}_${year}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const score = await analysisEngine.calculateHealthScore(state, parseInt(year));

    if (!score) {
      return res.status(404).json({ error: 'Insufficient data for health score calculation' });
    }

    // Add data quality warnings
    const result = {
      ...score,
      dataQuality: analysisEngine.getDataQualityWarnings(),
      stateSpecificWarnings: analysisEngine.getDataQualityWarnings().knownIssues
        .filter(issue => issue.state === state.toUpperCase())
    };

    cache.set(cacheKey, result, 7200);
    res.json(result);
  } catch (error) {
    console.error('Error calculating health score:', error.message);
    res.status(500).json({ error: 'Failed to calculate health score' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Connected to CDC API: ${CDC_API_BASE}`);
});
