const https = require('https');
const token = process.env.VERCEL_TOKEN;
const fs = require('fs');
function log(m) { fs.writeFileSync('/tmp/verify2-log.txt', m + '\n', {flag:'a'}); }

// Force verification check
const postData = JSON.stringify({ method: 'TXT', domain: '_vercel.logistiqs.live', value: 'vc-domain-verify=backhaulai.logistiqs.live,e073c0b99450f3a40596' });

const req = https.request({
  hostname: 'api.vercel.com',
  method: 'POST',
  path: '/v9/projects/prj_ueVlcIrbnAkF36ZEinqK9kBo3xQ7/domains/backhaulai.logistiqs.live/verify',
  headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
}, (res) => {
  let d = ''; res.on('data', c => d += c); res.on('end', () => log('Verify result: ' + d));
});
req.write(postData);
req.end();
req.on('error', e => log('ERR: ' + e.message));