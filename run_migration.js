const fs = require('fs');
const https = require('https');

const API_KEY = 'sbp_74d95083f0e2887cdfac997c08b4c3b1458fa58e';
const PROJECT_REF = 'xuzxlzgdhqrgtgpqqkri';
const sqlQuery = fs.readFileSync('./supabase/migrations/20260314000000_core_barflow_schema.sql', 'utf8');

const data = JSON.stringify({ query: sqlQuery });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
