import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required']
  },
  url: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Image = mongoose.model("Image", imageSchema);

export default Image; 