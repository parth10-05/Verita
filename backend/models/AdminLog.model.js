import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin reference is required']
  },
  action_type: {
    type: String,
    enum: ['ban_user', 'unban_user', 'reject_question', 'approve_question', 'delete_answer', 'send_announcement', 'edit_tag', 'delete_tag'],
    required: [true, 'Action type is required']
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel',
    required: [true, 'Target reference is required']
  },
  targetModel: {
    type: String,
    required: [true, 'Target model is required'],
    enum: ['User', 'Question', 'Answer', 'Tag']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, { timestamps: true });

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

export default AdminLog; 