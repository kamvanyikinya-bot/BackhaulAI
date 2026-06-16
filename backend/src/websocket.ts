import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { GPSService } from './services/gps.service';

interface GPSPayload {
  type: 'location_update' | 'ping';
  trip_id: string;
  lat?: number;
  lng?: number;
  speed?: number;
  heading?: number;
}

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });
  const connections = new Map<string, Set<WebSocket>>();

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    if (url.pathname.startsWith('/ws/gps/')) {
      const tripId = url.pathname.split('/').pop();
      if (tripId) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, tripId);
        });
      } else {
        socket.destroy();
      }
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, tripId: string) => {
    if (!connections.has(tripId)) {
      connections.set(tripId, new Set());
    }
    connections.get(tripId)!.add(ws);

    ws.send(JSON.stringify({ type: 'connected', trip_id: tripId, message: 'GPS tracking active' }));

    ws.on('message', async (message: string) => {
      try {
        const data: GPSPayload = JSON.parse(message);
        if (data.type === 'location_update') {
          const { trip_id, lat, lng, speed, heading } = data;
          if (lat !== undefined && lng !== undefined) {
            const timestamp = new Date().toISOString();
            const update = { type: 'location_update', trip_id, lat, lng, speed, heading, timestamp };
            
            // Persist to DB
            await GPSService.recordLocation({ trip_id, lat, lng, speed, heading });
            
            // Broadcast to all watchers of this trip
            const clients = connections.get(trip_id);
            if (clients) {
              const payload = JSON.stringify(update);
              clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(payload);
                }
              });
            }
          }
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', trip_id: tripId }));
        }
      } catch (error) {
        console.error('WS Error:', error);
      }
    });

    ws.on('close', () => {
      connections.get(tripId)?.delete(ws);
      if (connections.get(tripId)?.size === 0) {
        connections.delete(tripId);
      }
    });
  });

  return wss;
}
