import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters long'],
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  body: {
    type: String,
    required: [true, 'Question body is required'],
    trim: true,
    minlength: [20, 'Question body must be at least 20 characters long']
  },
  tagIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

export default Question; 