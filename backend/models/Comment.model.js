import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: [true, 'Answer reference is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author reference is required']
  },
  body: {
    type: String,
    required: [true, 'Comment body is required'],
    trim: true,
    minlength: [2, 'Comment body must be at least 2 characters long'],
    maxlength: [1000, 'Comment body cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment; 