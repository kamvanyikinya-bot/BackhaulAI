/**
 * BackhaulAI — Unified Production Server
 * Serves frontend + backend API + AI agent proxy on a single port.
 * Deploy anywhere: Railway, Render, Fly.io, or any Node.js host.
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve frontend build
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Proxy /api/* to the Node.js backend
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://localhost:3000',
  changeOrigin: true,
}));

// Proxy /agent/* and /match/* and /discover/* and /pricing/* and other AI endpoints
app.use(['/agent', '/match', '/discover', '/pricing', '/demand', '/route-optimiser', '/corridors', '/health'], createProxyMiddleware({
  target: process.env.AI_URL || 'http://localhost:8004',
  changeOrigin: true,
}));

// SPA fallback — all other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏗️  BackhaulAI production server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`📍 AI: http://localhost:${PORT}/health`);
});
