import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import branchRoutes from './routes/branches';
import memberRoutes from './routes/members';
import packageRoutes from './routes/packages';
import subscriptionRoutes from './routes/subscriptions';
import attendanceRoutes from './routes/attendance';
import coachRoutes from './routes/coaches';
import paymentRoutes from './routes/payments';
import inquiryRoutes from './routes/inquiries';
import dashboardRoutes from './routes/dashboard';
import whatsappRoutes from './routes/whatsapp';

const app = express();
const PORT = process.env.PORT || 4000;

// Security & logging
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 FitCore API running on http://localhost:${PORT}`);
});

export default app;
