const https = require('https');
const token = process.env.VERCEL_TOKEN;
const fs = require('fs');

function log(msg) { fs.writeFileSync('/tmp/domain-log.txt', msg + '\n', {flag:'a'}); }

log('Starting domain add...');

const opts = {
  hostname: 'api.vercel.com',
  path: '/v9/projects?limit=20',
  headers: { 'Authorization': 'Bearer ' + token }
};

https.get(opts, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    log('Got projects response');
    const projects = JSON.parse(d);
    const projList = (projects.projects || []).map(p => p.name + ':' + p.id).join(', ');
    log('Projects: ' + projList);
    
    const proj = (projects.projects || []).find(p => p.name === 'frontend');
    if (!proj) {
      log('NO_PROJECT_FOUND with name=frontend');
      return;
    }
    log('Found project: ' + proj.name + ' (' + proj.id + ')');
    
    // Add domain
    const body = JSON.stringify({ name: 'backhaulai.logistiqs.live' });
    const req = https.request({
      hostname: 'api.vercel.com',
      method: 'POST',
      path: '/v9/projects/' + proj.id + '/domains',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    }, (res2) => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => {
        log('Domain add response: ' + d2);
      });
    });
    req.write(body);
    req.end();
  });
}).on('error', e => log('ERROR: ' + e.message));