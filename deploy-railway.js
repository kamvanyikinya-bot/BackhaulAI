const { execSync } = require('child_process');
const fs = require('fs');

function log(m) { fs.appendFileSync('/tmp/railway-log.txt', m + '\n'); }

log('Starting Railway deploy...');
log('Token length: ' + (process.env.RAILWAY_TOKEN || '').length);

// login then deploy
const cmds = [
  'npx --yes railway login --token "' + process.env.RAILWAY_TOKEN + '" 2>&1',
  'cd /home/team/shared/backend && npx --yes railway up --service backhaul-api --environment production 2>&1',
  'cd /home/team/shared/ai-agents && npx --yes railway up --service backhaul-ai --environment production 2>&1'
];

for (const cmd of cmds) {
  try {
    const r = execSync(cmd, { timeout: 180000, encoding: 'utf8', shell: '/bin/bash' });
    log('OK: ' + r.substring(0, 1000));
  } catch(e) {
    log('ERR: ' + (e.stdout || '').substring(0, 500) + ' | ' + (e.stderr || '').substring(0, 500));
  }
}

log('ALL_DONE');