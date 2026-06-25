// Vercel Serverless Function — wraps the Express backend
// This allows the entire backend to deploy on Vercel alongside the frontend

const express = require('../backend/node_modules/express');
const cors = require('../backend/node_modules/cors');
const helmet = require('../backend/node_modules/helmet');

// Import all route modules
const authRoutes = require('../backend/dist/routes/auth.routes');
const userRoutes = require('../backend/dist/routes/user.routes');
const loadRoutes = require('../backend/dist/routes/load.routes');
const truckRoutes = require('../backend/dist/routes/truck.routes');
const tripRoutes = require('../backend/dist/routes/trip.routes');
const discoveryRoutes = require('../backend/dist/routes/discovery.routes');
const kycRoutes = require('../backend/dist/routes/kyc.routes');
const subscriptionRoutes = require('../backend/dist/routes/subscription.routes');
const reputationRoutes = require('../backend/dist/routes/reputation.routes');
const gpsRoutes = require('../backend/dist/routes/gps.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/loads', loadRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', discoveryRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/gps', gpsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Export for Vercel serverless
module.exports = app;