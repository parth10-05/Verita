import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  targetType: {
    type: String,
    enum: ['question', 'answer'],
    required: [true, 'Target type is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required']
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: [true, 'Vote value is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote; 