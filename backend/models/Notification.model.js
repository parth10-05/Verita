import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient reference is required']
  },
  type: {
    type: String,
    enum: ['new_answer', 'new_comment', 'mention'],
    required: [true, 'Notification type is required']
  },
  referenceType: {
    type: String,
    enum: ['question', 'answer', 'comment'],
    required: [true, 'Reference type is required']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Reference ID is required']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; 