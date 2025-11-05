# 🧠 US Health Intelligence Platform

An **AI-powered** full-stack analytics platform that goes beyond simple data visualization to provide **intelligent insights, predictions, and analysis** of U.S. Chronic Disease data from [data.gov](https://data.gov).

Unlike traditional data dashboards, this platform uses **statistical analysis, machine learning, and automated insight generation** to surface non-obvious patterns and relationships in public health data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🌟 Intelligent Features

### 🧠 AI-Generated Insights (NEW!)
- **Automated pattern discovery** - AI analyzes millions of data points to find significant trends
- **Statistical correlation analysis** - Identifies relationships between different health indicators
- **Anomaly detection** using z-score analysis - Flags unusual state-level patterns
- **Trend forecasting** with linear regression - Predicts future health outcomes
- **Geographic clustering** - Identifies regional health patterns
- **Natural language insight generation** - Converts statistical findings into readable insights
- **Significance scoring** - Ranks insights by statistical importance

### 🏆 State Health Rankings (NEW!)
- **Composite health scores** calculated from multiple weighted indicators
- **Grade-based ranking system** (A+ to F) for easy interpretation
- **Multi-factor analysis** combining diabetes, obesity, cardiovascular, cancer, smoking, and exercise data
- **Detailed state breakdowns** showing individual metric contributions
- **Interactive visualizations** with color-coded performance levels
- **Benchmarking against national averages**

### 📊 Interactive Dashboard
- Real-time statistics and overview of available health data
- Browse 115+ health indicators across multiple topics
- Coverage of all 50 U.S. states and territories
- Data spanning multiple decades

### 📈 Time Series Analysis
- Track health indicators over time
- Visualize trends with interactive line charts
- Compare different time periods
- View confidence intervals for statistical accuracy
- Filter by state, demographics, and health topics

### 🗺️ State-by-State Comparison
- Compare health metrics across all states and territories
- Interactive horizontal bar charts
- Sortable rankings (highest/lowest)
- Identify regional patterns and variations
- Detailed state-level statistics

### 🔍 Advanced Data Explorer
- Powerful multi-dimensional filtering
- Search by topic, state, year range, and stratification
- Paginated data tables with detailed information
- **Export to CSV** for offline analysis
- Browse thousands of health records

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd us-health-insights-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, backend, and frontend)
   npm run install-all

   # Or install manually
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend (optional - defaults work out of the box)
   cd backend
   cp .env.example .env
   # Edit .env if needed (default PORT=3001)
   ```

4. **Start the development servers**
   ```bash
   # From root directory - starts both backend and frontend
   npm run dev

   # Or start separately:
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🏗️ Architecture

### Technology Stack

**Backend**
- **Node.js + Express** - RESTful API server
- **Custom Analysis Engine** - Statistical analysis and ML algorithms
- **Axios** - HTTP client for CDC API integration
- **Node-Cache** - In-memory caching (1-hour TTL)
- **CORS** - Cross-origin resource sharing
- **Linear Regression** - Trend prediction and forecasting
- **Statistical Analysis** - Correlation, standard deviation, z-scores

**Frontend**
- **React 18** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Chart.js + react-chartjs-2** - Interactive visualizations
- **Axios** - API communication

**Data Source**
- **CDC API** via data.gov - U.S. Chronic Disease Indicators
- **Socrata Open Data API** (SODA) format

### Project Structure

```
us-health-insights-dashboard/
├── backend/
│   ├── server.js           # Express server with API routes
│   ├── analysis-engine.js  # Intelligent analysis algorithms
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── InsightsView.jsx        # NEW: AI-generated insights
│   │   │   ├── HealthRankingsView.jsx  # NEW: State health rankings
│   │   │   ├── TimeSeriesView.jsx
│   │   │   ├── StateComparisonView.jsx
│   │   │   └── DataExplorer.jsx
│   │   ├── services/
│   │   │   └── api.js      # API client
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 📡 API Endpoints

### Backend API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/topics` | GET | Get all available health topics |
| `/api/states` | GET | Get all states and territories |
| `/api/questions/:topic` | GET | Get indicators for a specific topic |
| `/api/stratifications` | GET | Get demographic stratification categories |
| `/api/data` | GET | Get filtered data (supports multiple query params) |
| `/api/timeseries` | GET | Get time series data for an indicator |
| `/api/state-comparison` | GET | Get state comparison data |
| `/api/summary` | GET | Get summary statistics |
| `/api/insights` | GET | **NEW:** Get AI-generated insights and patterns |
| `/api/health-rankings` | GET | **NEW:** Get composite health scores for all states |
| `/api/health-score/:state` | GET | **NEW:** Get detailed health score for a specific state |
| `/health` | GET | Health check endpoint |

### Query Parameters

**`/api/data`**
- `topic` - Health topic (e.g., "Cancer", "Diabetes")
- `state` - State abbreviation (e.g., "CA", "US")
- `yearStart` - Start year filter
- `yearEnd` - End year filter
- `question` - Specific health indicator
- `stratification` - Demographic category
- `limit` - Maximum records (default: 5000)

**`/api/timeseries`**
- `topic` - Health topic (required)
- `question` - Specific indicator (required)
- `state` - State abbreviation (default: "US")
- `stratification` - Demographic category (default: "Overall")

**`/api/state-comparison`**
- `topic` - Health topic (required)
- `question` - Specific indicator (required)
- `year` - Comparison year (required)
- `stratification` - Demographic category (default: "Overall")

## 🎨 Intelligence & Analysis

### How the AI Insights Work

The platform performs several types of intelligent analysis:

**1. Correlation Analysis**
- Calculates Pearson correlation coefficients between different health indicators
- Example: Identifies the relationship between obesity and diabetes rates
- Flags correlations above 0.5 threshold as significant

**2. Trend Analysis & Prediction**
- Uses linear regression to model historical trends
- Calculates R² values to measure prediction confidence
- Projects future values based on historical slopes
- Example: Forecasts 2025 cardiovascular disease mortality rates

**3. Anomaly Detection**
- Calculates z-scores for all states on various metrics
- Flags values more than 2 standard deviations from mean
- Identifies states with unusual patterns requiring investigation

**4. Geographic Pattern Recognition**
- Groups states into 5 regions (Northeast, Southeast, Midwest, Southwest, West)
- Calculates regional averages for health metrics
- Identifies regional trends and cultural/policy patterns

**5. State Health Scoring**
- Weighted composite score (0-100) from 6 key indicators:
  - Obesity (20%), Diabetes (15%), Smoking (15%)
  - Cancer mortality (20%), CVD mortality (20%), Exercise (10%)
- Normalized against national averages
- Letter grades (A+ to F) for easy interpretation

**6. Improvement Tracking**
- Identifies states with strongest positive/negative trends
- Calculates percentage changes over time periods
- Highlights success stories and concerning patterns

### Caching Strategy
- **1-hour TTL** for all cached data
- Reduces API calls to CDC
- Improves response times
- Cache keys based on query parameters

### Data Visualization
- **Chart.js** for high-performance rendering
- Interactive tooltips and legends
- Responsive design for all screen sizes
- Color-coded for clarity

### Export Functionality
- Export filtered data to CSV format
- Preserves all data fields
- Automatic filename with timestamp
- Handles special characters and quotes

## 📊 Data Source

This application uses the **U.S. Chronic Disease Indicators (CDI)** dataset from the Centers for Disease Control and Prevention (CDC), available on [data.gov](https://catalog.data.gov/dataset/u-s-chronic-disease-indicators).

### About the Dataset
- **115 indicators** developed by consensus among CDC, CSTE, and NACDD
- Covers chronic diseases and risk factors with substantial public health impact
- State and territory-level data
- Multiple data sources: BRFSS, NVSS, YRBSS, NSCH, PRAMS
- Regular updates from CDC

### Topics Include
- Alcohol
- Arthritis
- Asthma
- Cancer
- Cardiovascular Disease
- Chronic Kidney Disease
- Chronic Obstructive Pulmonary Disease (COPD)
- Diabetes
- Disability
- Immunization
- Mental Health
- Nutrition, Physical Activity, and Weight Status
- Oral Health
- Tobacco
- And more...

## 🔧 Development

### Available Scripts

**Root Level**
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build frontend for production
npm run start            # Start production server
```

**Backend**
```bash
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server
```

**Frontend**
```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Environment Variables

**Backend (.env)**
```bash
PORT=3001
NODE_ENV=development
```

## 🚀 Deployment

### Building for Production

1. **Build the frontend**
   ```bash
   npm run build
   ```
   This creates an optimized build in `frontend/dist/`

2. **Serve static files**
   Configure your backend to serve the built frontend files, or deploy them separately to a CDN.

3. **Start the backend**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

### Deployment Platforms

**Recommended Options:**
- **Backend**: Heroku, Railway, Render, AWS EC2
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Full-Stack**: DigitalOcean, AWS, Google Cloud

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Data Source**: Centers for Disease Control and Prevention (CDC)
- **Open Data Platform**: data.gov
- **API Technology**: Socrata Open Data API (SODA)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with data from [data.gov](https://data.gov) - the home of the U.S. Government's open data**