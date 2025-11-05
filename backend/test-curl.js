const { execSync } = require('child_process');

function curlGet(url) {
  try {
    const result = execSync(`curl -s "${url}"`, {
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024
    });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Curl failed: ${error.message}`);
  }
}

async function test() {
  try {
    const url = 'https://data.cdc.gov/resource/hksd-2xuw.json?topic=Diabetes&$limit=3';
    console.log('Testing curl from Node...');
    const data = curlGet(url);
    console.log('✅ SUCCESS! Got', data.length, 'records');
    console.log('First record:', JSON.stringify(data[0], null, 2).substring(0, 300));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
