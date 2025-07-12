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
import userRoutes from './routes/user.routes.js';
import tagRoutes from './routes/tag.routes.js';
import commentRoutes from './routes/comment.routes.js';
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

// API routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/comments', commentRoutes);

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