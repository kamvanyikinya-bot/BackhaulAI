// Vercel deploy script — runs vercel CLI via Node.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const frontendDir = '/home/team/shared/frontend';
const token = process.env.VERCEL_TOKEN;

console.log('VERCEL_TOKEN available:', !!token);

try {
  const result = execSync(
    `npx --yes vercel --prod --token "${token}" --yes`,
    {
      cwd: frontendDir,
      timeout: 120000,
      encoding: 'utf8',
      env: { ...process.env, HOME: process.env.HOME }
    }
  );
  console.log('DEPLOY OUTPUT:', result);
  
  // Save result
  fs.writeFileSync('/tmp/deploy-success.txt', result);
  console.log('DEPLOY COMPLETE');
} catch (err) {
  console.error('DEPLOY ERROR:', err.message);
  console.error('STDOUT:', err.stdout);
  console.error('STDERR:', err.stderr);
  fs.writeFileSync('/tmp/deploy-error.txt', err.message + '\n' + (err.stdout || '') + '\n' + (err.stderr || ''));
}