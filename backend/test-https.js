const https = require('https');
const { URL } = require('url');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/json'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse JSON: ' + e.message));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function test() {
  try {
    const url = 'https://data.cdc.gov/resource/hksd-2xuw.json?topic=Diabetes&$limit=3';
    console.log('Testing native https module...');
    const data = await httpsGet(url);
    console.log('✅ SUCCESS! Got', data.length, 'records');
    console.log('First record topic:', data[0].topic);
    console.log('First record question:', data[0].question);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
