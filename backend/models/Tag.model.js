import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [2, 'Tag name must be at least 2 characters long'],
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: [true, 'Tag slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag; 