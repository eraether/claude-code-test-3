const axios = require('axios');

async function test() {
  try {
    const url = 'https://data.cdc.gov/resource/hksd-2xuw.json?topic=Diabetes&$limit=3';
    console.log('Testing:', url);

    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 10
    });

    console.log('Success! Got', response.data.length, 'records');
    console.log('First record:', JSON.stringify(response.data[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

test();
