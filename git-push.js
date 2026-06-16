const { execSync } = require('child_process');
const fs = require('fs');
function log(m) { fs.appendFileSync('/tmp/git-log.txt', m + '\n'); }

const cmds = [
  'cd /home/team/shared && git init',
  'cd /home/team/shared && git remote add origin https://github.com/kamvanyikinya-bot/BackhaulAI.git 2>&1 || git remote set-url origin https://github.com/kamvanyikinya-bot/BackhaulAI.git',
  'cd /home/team/shared && git add -A',
  'cd /home/team/shared && git commit -m "Initial commit: Full BackhaulAI platform" 2>&1 || echo "Commit may have already existed"',
  'cd /home/team/shared && git push -u origin main 2>&1'
];

for (const cmd of cmds) {
  try {
    const r = execSync(cmd, { timeout: 60000, encoding: 'utf8' });
    log('OK: ' + r.substring(0, 500));
  } catch(e) {
    log('ERR: ' + (e.stdout || '').substring(0, 200) + ' | ' + (e.message || '').substring(0, 200));
  }
}
log('PUSH_DONE');