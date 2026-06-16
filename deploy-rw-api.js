// Deploy to Railway via API using the token
const https = require('https');
const fs = require('fs');
const path = require('path');

const token = 'dfecf2f1-eba3-4536-8ad4-c7115b5a0d53';

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'backboard.railway.com',
      method: method,
      path: urlPath,
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  fs.writeFileSync('/tmp/rw-api.txt', '');
  const log = m => fs.appendFileSync('/tmp/rw-api.txt', m + '\n');

  // 1. Test connection - list projects
  try {
    const projects = await api('GET', '/graphql?query={projects{id,name}}');
    log('Projects: ' + projects);
  } catch(e) { log('ERR: ' + e.message); }

  // 2. Create project + deploy using the CLI approach
  // Instead, let's try the simpler approach - use Railway's deploy API
  log('Attempting deploy via Railway CLI...');
  
  const { execSync } = require('child_process');
  try {
    const r = execSync(
      'cd /home/team/shared/backend && ' +
      'npx --yes railway login --token ' + token + ' 2>&1 && ' +
      'npx --yes railway up --service backhaul-api 2>&1',
      { timeout: 180000, encoding: 'utf8', shell: '/bin/bash' }
    );
    log('BACKEND: ' + r.substring(0, 2000));
  } catch(e) {
    log('BACKEND_ERR: ' + (e.message || '') + (e.stdout || '').substring(0, 1000));
  }

  log('DONE');
}

main();