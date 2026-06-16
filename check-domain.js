const https = require('https');
const token = process.env.VERCEL_TOKEN;
const fs = require('fs');

function log(m) { fs.writeFileSync('/tmp/verify-log.txt', m + '\n', {flag:'a'}); }

// Check domain status
const opts = {
  hostname: 'api.vercel.com',
  path: '/v9/projects/prj_ueVlcIrbnAkF36ZEinqK9kBo3xQ7/domains/backhaulai.logistiqs.live',
  headers: { 'Authorization': 'Bearer ' + token }
};

https.get(opts, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    log('Domain status: ' + d);
  });
}).on('error', e => log('ERR: ' + e.message));