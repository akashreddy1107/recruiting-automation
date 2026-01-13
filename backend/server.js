import './loadEnv.js'; // Must be first!
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './data/db.js';

import authRoutes from './routes/auth.routes.js';
import candidatesRoutes from './routes/candidates.routes.js';
import runsRoutes from './routes/runs.routes.js';
import emailRoutes from './routes/email.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import jobsRoutes from './routes/jobs.routes.js';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/jobs', jobsRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Recruiting Automation API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
