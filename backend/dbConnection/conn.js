import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit';
        const conn = await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

export default connectDB;