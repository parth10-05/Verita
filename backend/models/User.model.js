import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  is_banned: {
    type: Boolean,
    default: false
  },
  profile_photo: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  resetPasswordTokenOtp: {
    type: String,
    default: null
  },
  resetPasswordExpiresOtp: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User; 