const https = require('https');
const token = process.env.VERCEL_TOKEN;

// List projects
const opts = {
  hostname: 'api.vercel.com',
  path: '/v9/projects?limit=20',
  headers: { 'Authorization': `Bearer ${token}` }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const projects = JSON.parse(data);
    const names = (projects.projects || []).map(p => p.name + ':' + p.id).join(', ');
    const body = JSON.stringify({ name: 'backhaulai.logistiqs.live' });
    
    // Find our project
    const proj = (projects.projects || []).find(p => p.name === 'frontend');
    if (!proj) {
      require('fs').writeFileSync('/tmp/vercel-done.txt', 'NO_PROJECT_FOUND: ' + names);
      return;
    }
    
    // Add domain
    const req = https.request({
      hostname: 'api.vercel.com',
      method: 'POST',
      path: `/v9/projects/${proj.id}/domains`,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }, (res2) => {
      let d = '';
      res2.on('data', c => d += c);
      res2.on('end', () => {
        require('fs').writeFileSync('/tmp/vercel-done.txt', 'DOMAIN_ADDED: ' + d);
      });
    });
    req.write(body);
    req.end();
  });
}).on('error', e => require('fs').writeFileSync('/tmp/vercel-done.txt', 'ERROR: ' + e.message));