import http from 'http';
import app from './app';
import { setupWebsocket } from './websocket';

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

// Setup WebSocket
setupWebsocket(server);

server.listen(Number(PORT), HOST, () => {
  console.log(`BackhaulAI API running on http://${HOST}:${PORT}`);
});
