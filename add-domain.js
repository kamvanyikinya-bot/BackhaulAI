// Add custom domain to Vercel project
const projectId = 'prj_'; // We need to find the project ID first

async function main() {
  const token = process.env.VERCEL_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Step 1: Get the project ID
  const listResp = await fetch('https://api.vercel.com/v9/projects', { headers });
  const projects = await listResp.json();
  
  await require('fs').promises.writeFile('/tmp/vercel-projects.json', JSON.stringify(projects, null, 2));
  
  // Find our project
  const project = (projects.projects || []).find(p => p.name === 'frontend' || p.name?.includes('frontend'));
  
  if (!project) {
    const msg = 'No matching project found. Available: ' + (projects.projects || []).map(p => p.name).join(', ');
    await require('fs').promises.writeFile('/tmp/domain-result.txt', msg);
    return;
  }
  
  // Step 2: Add the domain
  const addResp = await fetch(`https://api.vercel.com/v9/projects/${project.id}/domains`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'backhaulai.logistiqs.live' })
  });
  const result = await addResp.json();
  
  await require('fs').promises.writeFile('/tmp/domain-result.txt', JSON.stringify(result, null, 2));
}

main().catch(e => {
  require('fs').promises.writeFile('/tmp/domain-result.txt', 'ERROR: ' + e.message);
});