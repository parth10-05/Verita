import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question reference is required']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true,
    minlength: [10, 'Answer content must be at least 10 characters long']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  is_accepted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Answer = mongoose.model("Answer", answerSchema);

export default Answer; 