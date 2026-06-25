import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import discoveryRoutes from './routes/discovery.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import loadRoutes from './routes/load.routes';
import truckRoutes from './routes/truck.routes';
import tripRoutes from './routes/trip.routes';
import kycRoutes from './routes/kyc.routes';
import subscriptionRoutes from './routes/subscription.routes';
import reputationRoutes from './routes/reputation.routes';
import gpsRoutes from './routes/gps.routes';
import eftRoutes from './routes/eft.routes';
import { StatsController } from './controllers/stats.controller';
import { authenticate } from './middleware/auth.middleware';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Relax CSP for the frontend to work easily
}));
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/eft', eftRoutes);
app.use('/api/stats', authenticate, StatsController.getDashboardStats);
app.use('/api', discoveryRoutes);

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all for SPA
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

export default app;
