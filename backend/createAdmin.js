import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: await bcrypt.hash('admin123', 10),
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [{ email: adminData.email }, { username: adminData.username }] 
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('ID:', existingAdmin._id);
    } else {
      // Create new admin user
      const newAdmin = new User(adminData);
      await newAdmin.save();
      console.log('Admin user created successfully:');
      console.log('Username:', newAdmin.username);
      console.log('Email:', newAdmin.email);
      console.log('Role:', newAdmin.role);
      console.log('ID:', newAdmin._id);
    }

    // List all admin users
    const allAdmins = await User.find({ role: 'admin' });
    console.log('\nAll admin users:');
    allAdmins.forEach(admin => {
      console.log(`- ${admin.username} (${admin.email}) - Role: ${admin.role}`);
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser(); 