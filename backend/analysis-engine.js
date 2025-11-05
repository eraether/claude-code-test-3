const { execSync } = require('child_process');

const CDC_API_BASE = 'https://data.cdc.gov/resource/hksd-2xuw.json';

// Helper to fetch data using curl (works in this environment where axios/https fail)
function curlGet(url) {
  try {
    // Use single quotes to prevent shell interpretation of $ in $limit
    const result = execSync(`curl -s '${url}'`, {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Curl failed: ${error.message}`);
  }
}

// Statistical utilities
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const stdDev = (arr) => {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

const correlation = (x, y) => {
  const n = Math.min(x.length, y.length);
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = stdDev(x);
  const stdY = stdDev(y);

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += ((x[i] - meanX) / stdX) * ((y[i] - meanY) / stdY);
  }

  return sum / (n - 1);
};

// Linear regression for trend analysis
const linearRegression = (x, y) => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R²
  const yMean = mean(y);
  const totalSS = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const residualSS = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const rSquared = 1 - (residualSS / totalSS);

  return { slope, intercept, rSquared };
};

class AnalysisEngine {
  constructor() {
    this.cache = new Map();
  }

  // Fetch data for analysis
  async fetchData(query, limit = 10000) {
    const cacheKey = JSON.stringify(query);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Build query string manually
      const queryParts = [];
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          // Don't encode $ in key names (for $limit, $where, etc.)
          const encodedKey = key.startsWith('$') ? key : encodeURIComponent(key);
          queryParts.push(`${encodedKey}=${encodeURIComponent(value)}`);
        }
      }

      // Only add $limit if not already in query
      if (!query.$limit && !query['$limit']) {
        queryParts.push(`$limit=${limit}`);
      }

      const url = `${CDC_API_BASE}?${queryParts.join('&')}`;
      console.log('Fetching:', url.substring(0, 120) + '...');

      const data = curlGet(url); // Using curl since it works in this environment
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      return [];
    }
  }

  // Generate comprehensive insights
  async generateInsights() {
    const insights = [];

    try {
      // 1. Identify fastest improving states
      const improvementInsight = await this.analyzeStateImprovements();
      insights.push(...improvementInsight);

      // 2. Find strong correlations between health indicators
      const correlationInsights = await this.findHealthCorrelations();
      insights.push(...correlationInsights);

      // 3. Detect anomalies
      const anomalies = await this.detectAnomalies();
      insights.push(...anomalies);

      // 4. Identify geographic clusters
      const clusterInsights = await this.identifyGeographicPatterns();
      insights.push(...clusterInsights);

      // 5. Generate predictions
      const predictions = await this.generatePredictions();
      insights.push(...predictions);

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    // Sort by significance
    insights.sort((a, b) => b.significance - a.significance);

    return insights;
  }

  // Analyze which states have improved the most
  async analyzeStateImprovements() {
    const insights = [];

    try {
      // Get diabetes prevalence data
      const diabetesData = await this.fetchData({
        topic: 'Diabetes',
        question: 'Prevalence of diagnosed diabetes among adults aged >= 18 years',
        stratification1: 'Overall'
      });

      // Calculate improvements by state
      const stateImprovements = {};

      diabetesData.forEach(record => {
        const state = record.locationabbr;
        const year = parseInt(record.yearstart);
        const value = parseFloat(record.datavalue);

        if (!state || !year || !value || state === 'US') return;

        if (!stateImprovements[state]) {
          stateImprovements[state] = {
            name: record.locationdesc,
            values: []
          };
        }

        stateImprovements[state].values.push({ year, value });
      });

      // Calculate trends
      const trends = [];
      for (const [state, data] of Object.entries(stateImprovements)) {
        if (data.values.length < 3) continue;

        data.values.sort((a, b) => a.year - b.year);
        const years = data.values.map(v => v.year);
        const values = data.values.map(v => v.value);

        const regression = linearRegression(years, values);
        const percentChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;

        trends.push({
          state,
          name: data.name,
          trend: regression.slope,
          percentChange,
          rSquared: regression.rSquared,
          startValue: values[0],
          endValue: values[values.length - 1],
          yearRange: `${years[0]}-${years[years.length - 1]}`
        });
      }

      // Top improvers (negative slope = reduction in diabetes)
      trends.sort((a, b) => a.trend - b.trend);
      const topImprovers = trends.slice(0, 3);

      topImprovers.forEach((trend, idx) => {
        insights.push({
          type: 'improvement',
          title: `${trend.name} shows significant diabetes reduction`,
          description: `${trend.name} has reduced diabetes prevalence by ${Math.abs(trend.percentChange).toFixed(1)}% from ${trend.startValue.toFixed(1)}% to ${trend.endValue.toFixed(1)}% (${trend.yearRange}). This represents one of the strongest improvements nationally.`,
          significance: 90 - (idx * 5),
          data: trend,
          category: 'Diabetes'
        });
      });

      // Top decliners (positive slope = increase in diabetes)
      const topDecliners = trends.slice(-3).reverse();

      topDecliners.forEach((trend, idx) => {
        insights.push({
          type: 'concern',
          title: `${trend.name} shows rising diabetes prevalence`,
          description: `${trend.name} has experienced a ${trend.percentChange.toFixed(1)}% increase in diabetes prevalence from ${trend.startValue.toFixed(1)}% to ${trend.endValue.toFixed(1)}% (${trend.yearRange}). This trend warrants attention.`,
          significance: 80 - (idx * 5),
          data: trend,
          category: 'Diabetes'
        });
      });

    } catch (error) {
      console.error('Error analyzing improvements:', error);
    }

    return insights;
  }

  // Find correlations between different health indicators
  async findHealthCorrelations() {
    const insights = [];

    try {
      // Get obesity and diabetes data for the same year
      const year = 2021;

      const [obesityData, diabetesData, cardiovascularData] = await Promise.all([
        this.fetchData({
          topic: 'Nutrition, Physical Activity, and Weight Status',
          yearstart: year,
          stratification1: 'Overall'
        }),
        this.fetchData({
          topic: 'Diabetes',
          yearstart: year,
          stratification1: 'Overall'
        }),
        this.fetchData({
          topic: 'Cardiovascular Disease',
          yearstart: year,
          stratification1: 'Overall'
        })
      ]);

      // Create state-indexed data
      const stateData = {};

      obesityData.forEach(record => {
        const state = record.locationabbr;
        const value = parseFloat(record.datavalue);
        if (!state || !value || state === 'US') return;

        if (!stateData[state]) stateData[state] = { name: record.locationdesc };
        if (record.question.includes('Obesity')) {
          stateData[state].obesity = value;
        }
      });

      diabetesData.forEach(record => {
        const state = record.locationabbr;
        const value = parseFloat(record.datavalue);
        if (!state || !value || state === 'US' || !stateData[state]) return;

        if (record.question.includes('diagnosed diabetes')) {
          stateData[state].diabetes = value;
        }
      });

      cardiovascularData.forEach(record => {
        const state = record.locationabbr;
        const value = parseFloat(record.datavalue);
        if (!state || !value || state === 'US' || !stateData[state]) return;

        if (record.question.includes('cardiovascular disease')) {
          stateData[state].cardiovascular = value;
        }
      });

      // Calculate correlations
      const states = Object.values(stateData).filter(s => s.obesity && s.diabetes);

      if (states.length > 10) {
        const obesityVals = states.map(s => s.obesity);
        const diabetesVals = states.map(s => s.diabetes);

        const corr = correlation(obesityVals, diabetesVals);

        if (Math.abs(corr) > 0.5) {
          insights.push({
            type: 'correlation',
            title: 'Strong correlation between obesity and diabetes',
            description: `Statistical analysis reveals a ${(corr > 0 ? 'positive' : 'negative')} correlation of ${corr.toFixed(3)} between obesity and diabetes rates across states (${year}). States with higher obesity rates tend to have proportionally higher diabetes prevalence.`,
            significance: Math.abs(corr) * 100,
            data: {
              correlation: corr,
              year,
              sampleSize: states.length,
              relationship: corr > 0 ? 'positive' : 'negative'
            },
            category: 'Cross-Indicator Analysis'
          });
        }
      }

      // Find states with unusually high/low ratios
      const ratios = states.map(s => ({
        state: s.name,
        ratio: s.diabetes / s.obesity,
        obesity: s.obesity,
        diabetes: s.diabetes
      }));

      ratios.sort((a, b) => b.ratio - a.ratio);
      const avgRatio = mean(ratios.map(r => r.ratio));
      const stdDevRatio = stdDev(ratios.map(r => r.ratio));

      const outliers = ratios.filter(r => Math.abs(r.ratio - avgRatio) > 1.5 * stdDevRatio);

      outliers.forEach(outlier => {
        insights.push({
          type: 'anomaly',
          title: `${outlier.state} shows unusual diabetes-to-obesity ratio`,
          description: `${outlier.state} has a diabetes-to-obesity ratio of ${outlier.ratio.toFixed(2)}, which is ${((outlier.ratio - avgRatio) / avgRatio * 100).toFixed(1)}% ${outlier.ratio > avgRatio ? 'higher' : 'lower'} than the national average. This suggests other factors beyond obesity may be influencing diabetes rates.`,
          significance: 70,
          data: outlier,
          category: 'Statistical Anomalies'
        });
      });

    } catch (error) {
      console.error('Error finding correlations:', error);
    }

    return insights;
  }

  // Detect statistical anomalies
  async detectAnomalies() {
    const insights = [];

    try {
      // Get recent cancer mortality data
      const cancerData = await this.fetchData({
        topic: 'Cancer',
        datasource: 'NVSS',
        stratification1: 'Overall'
      });

      // Group by state and calculate statistics
      const stateValues = {};

      cancerData.forEach(record => {
        const state = record.locationabbr;
        const value = parseFloat(record.datavalue);
        const year = parseInt(record.yearstart);

        if (!state || !value || state === 'US' || year < 2018) return;

        if (!stateValues[state]) {
          stateValues[state] = {
            name: record.locationdesc,
            values: []
          };
        }

        stateValues[state].values.push(value);
      });

      // Calculate mean and std dev for each state
      const stateStats = Object.entries(stateValues)
        .filter(([_, data]) => data.values.length >= 3)
        .map(([state, data]) => ({
          state,
          name: data.name,
          mean: mean(data.values),
          stdDev: stdDev(data.values),
          count: data.values.length
        }));

      if (stateStats.length > 0) {
        const allMeans = stateStats.map(s => s.mean);
        const overallMean = mean(allMeans);
        const overallStdDev = stdDev(allMeans);

        // Find outliers (z-score > 2)
        stateStats.forEach(state => {
          const zScore = (state.mean - overallMean) / overallStdDev;

          if (Math.abs(zScore) > 2) {
            insights.push({
              type: 'anomaly',
              title: `${state.name} has ${zScore > 0 ? 'elevated' : 'notably low'} cancer mortality`,
              description: `${state.name}'s cancer mortality rate (${state.mean.toFixed(1)} per 100,000) is ${Math.abs(zScore).toFixed(1)} standard deviations ${zScore > 0 ? 'above' : 'below'} the national average. This statistical anomaly warrants further investigation.`,
              significance: Math.min(95, 60 + Math.abs(zScore) * 10),
              data: {
                state: state.name,
                value: state.mean,
                nationalAvg: overallMean,
                zScore,
                deviation: ((state.mean - overallMean) / overallMean * 100)
              },
              category: 'Cancer'
            });
          }
        });
      }

    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }

    return insights;
  }

  // Identify geographic patterns
  async identifyGeographicPatterns() {
    const insights = [];

    try {
      // Define regions
      const regions = {
        'Northeast': ['CT', 'ME', 'MA', 'NH', 'RI', 'VT', 'NJ', 'NY', 'PA'],
        'Southeast': ['DE', 'FL', 'GA', 'MD', 'NC', 'SC', 'VA', 'WV', 'AL', 'KY', 'MS', 'TN', 'AR', 'LA'],
        'Midwest': ['IL', 'IN', 'MI', 'OH', 'WI', 'IA', 'KS', 'MN', 'MO', 'NE', 'ND', 'SD'],
        'Southwest': ['AZ', 'NM', 'OK', 'TX'],
        'West': ['CO', 'ID', 'MT', 'NV', 'UT', 'WY', 'AK', 'CA', 'HI', 'OR', 'WA']
      };

      // Get tobacco use data
      const tobaccoData = await this.fetchData({
        topic: 'Tobacco',
        yearstart: 2021,
        stratification1: 'Overall'
      });

      const regionData = {};

      tobaccoData.forEach(record => {
        const state = record.locationabbr;
        const value = parseFloat(record.datavalue);

        if (!state || !value || state === 'US') return;

        // Find region
        let region = null;
        for (const [regionName, states] of Object.entries(regions)) {
          if (states.includes(state)) {
            region = regionName;
            break;
          }
        }

        if (!region) return;

        if (!regionData[region]) regionData[region] = [];
        regionData[region].push(value);
      });

      // Calculate regional averages
      const regionalAverages = Object.entries(regionData)
        .map(([region, values]) => ({
          region,
          average: mean(values),
          count: values.length
        }))
        .filter(r => r.count >= 3);

      if (regionalAverages.length > 0) {
        regionalAverages.sort((a, b) => b.average - a.average);

        const highest = regionalAverages[0];
        const lowest = regionalAverages[regionalAverages.length - 1];

        insights.push({
          type: 'geographic',
          title: `Tobacco use varies significantly by region`,
          description: `The ${highest.region} region has the highest average tobacco use (${highest.average.toFixed(1)}%), while the ${lowest.region} has the lowest (${lowest.average.toFixed(1)}%). This ${((highest.average - lowest.average) / lowest.average * 100).toFixed(1)}% difference suggests regional cultural and policy factors play a significant role.`,
          significance: 75,
          data: {
            highest,
            lowest,
            all: regionalAverages
          },
          category: 'Tobacco'
        });
      }

    } catch (error) {
      console.error('Error identifying geographic patterns:', error);
    }

    return insights;
  }

  // Generate predictions based on trends
  async generatePredictions() {
    const insights = [];

    try {
      // Predict future cardiovascular disease mortality
      const cvdData = await this.fetchData({
        topic: 'Cardiovascular Disease',
        locationabbr: 'US',
        datasource: 'NVSS',
        stratification1: 'Overall'
      });

      // Filter for mortality data and sort by year
      const mortalityData = cvdData
        .filter(record => record.question && record.question.includes('Mortality') && record.datavalue)
        .map(record => ({
          year: parseInt(record.yearstart),
          value: parseFloat(record.datavalue)
        }))
        .filter(record => record.year >= 2010)
        .sort((a, b) => a.year - b.year);

      if (mortalityData.length >= 5) {
        const years = mortalityData.map(d => d.year);
        const values = mortalityData.map(d => d.value);

        const regression = linearRegression(years, values);

        // Predict 2025
        const prediction2025 = regression.slope * 2025 + regression.intercept;
        const currentValue = values[values.length - 1];
        const change = prediction2025 - currentValue;

        insights.push({
          type: 'prediction',
          title: 'Cardiovascular disease mortality forecast for 2025',
          description: `Based on trends from ${years[0]}-${years[years.length - 1]}, cardiovascular disease mortality is projected to ${change < 0 ? 'decrease' : 'increase'} to ${prediction2025.toFixed(1)} per 100,000 by 2025 (currently ${currentValue.toFixed(1)}). Model confidence: ${(regression.rSquared * 100).toFixed(0)}%.`,
          significance: regression.rSquared * 80,
          data: {
            prediction: prediction2025,
            current: currentValue,
            change,
            percentChange: (change / currentValue * 100),
            rSquared: regression.rSquared,
            trend: regression.slope < 0 ? 'declining' : 'increasing'
          },
          category: 'Cardiovascular Disease'
        });
      }

    } catch (error) {
      console.error('Error generating predictions:', error);
    }

    return insights;
  }

  // Calculate comprehensive health score for a state
  async calculateHealthScore(state, year = 2021) {
    try {
      // Get multiple indicators
      const data = await this.fetchData({
        locationabbr: state,
        yearstart: year,
        stratification1: 'Overall'
      });

      const metrics = {
        // Lower is better
        diabetes: null,
        obesity: null,
        smoking: null,
        cancer: null,
        cvd: null,
        // Higher is better
        exercise: null
      };

      data.forEach(record => {
        const value = parseFloat(record.datavalue);
        if (!value) return;

        const question = record.question.toLowerCase();

        if (question.includes('diabetes') && question.includes('prevalence')) {
          metrics.diabetes = value;
        } else if (question.includes('obesity')) {
          metrics.obesity = value;
        } else if (question.includes('smoking') || question.includes('tobacco')) {
          metrics.smoking = value;
        } else if (question.includes('cancer') && question.includes('mortality')) {
          metrics.cancer = value;
        } else if (question.includes('cardiovascular') && question.includes('mortality')) {
          metrics.cvd = value;
        } else if (question.includes('physical activity')) {
          metrics.exercise = value;
        }
      });

      // Calculate weighted score (0-100, higher is better)
      let score = 100;
      let components = 0;

      if (metrics.diabetes) {
        score -= (metrics.diabetes / 20) * 15; // Max -15
        components++;
      }
      if (metrics.obesity) {
        score -= (metrics.obesity / 40) * 20; // Max -20
        components++;
      }
      if (metrics.smoking) {
        score -= (metrics.smoking / 30) * 15; // Max -15
        components++;
      }
      if (metrics.cancer) {
        score -= (metrics.cancer / 200) * 20; // Max -20
        components++;
      }
      if (metrics.cvd) {
        score -= (metrics.cvd / 300) * 20; // Max -20
        components++;
      }
      if (metrics.exercise) {
        score += (metrics.exercise / 100) * 10; // Max +10
        components++;
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        metrics,
        components,
        year
      };

    } catch (error) {
      console.error('Error calculating health score:', error);
      return null;
    }
  }

  // Get health rankings for all states
  async getHealthRankings(year = 2021) {
    const rankings = [];

    // Get list of states
    const statesData = await this.fetchData({ yearstart: year, $limit: 1000 });

    // Handle case where fetchData returns empty or error
    if (!Array.isArray(statesData) || statesData.length === 0) {
      console.error('Failed to fetch states data or empty result');
      return [];
    }

    const states = [...new Set(statesData
      .map(r => ({ abbr: r.locationabbr, name: r.locationdesc }))
      .filter(s => s.abbr && s.abbr !== 'US' && s.abbr.length === 2)
      .map(s => JSON.stringify(s)))
    ].map(s => JSON.parse(s));

    // Calculate scores for each state
    for (const state of states.slice(0, 30)) { // Limit to avoid timeout
      const scoreData = await this.calculateHealthScore(state.abbr, year);
      if (scoreData && scoreData.components >= 3) {
        rankings.push({
          state: state.abbr,
          name: state.name,
          ...scoreData
        });
      }
    }

    rankings.sort((a, b) => b.score - a.score);

    return rankings;
  }
}

module.exports = new AnalysisEngine();
