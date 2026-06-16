const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  try {
    const r = execSync(cmd, { timeout: 30000, encoding: 'utf8' });
    return r.trim();
  } catch(e) {
    return 'ERROR: ' + e.message;
  }
}

// Check gh auth status
const status = run('gh auth status 2>&1');
fs.writeFileSync('/tmp/gh-status.txt', 'AUTH: ' + status + '\n');

// Try to create repos
const repos = ['backhaulai-frontend', 'backhaulai-backend', 'backhaulai-ai-agents'];
for (const repo of repos) {
  const result = run('gh repo create ' + repo + ' --private --yes 2>&1 || true');
  fs.writeFileSync('/tmp/repo-' + repo + '.txt', result);
}

fs.writeFileSync('/tmp/gh-done.txt', 'ALL DONE');