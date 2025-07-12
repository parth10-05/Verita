import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './dbConnection/conn.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import questionRoutes from './routes/question.routes.js';
import answerRoutes from './routes/answer.routes.js';
import voteRoutes from './routes/vote.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { initializeEmailTransporter } from './utils/email.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

initializeEmailTransporter();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/votes', voteRoutes);
app.use('/notifications', notificationRoutes);
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to StackIt API',
    status: 'Server is running',
  });
});

connectDB()
.then(() => {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});