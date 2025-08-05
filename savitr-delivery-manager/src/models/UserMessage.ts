import mongoose from 'mongoose';

const userMessageSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
  },
  recipient_type: {
    type: String,
    enum: ['sender', 'receiver'],
    required: true,
  },
  message_type: {
    type: String,
    enum: ['sms', 'email'],
    required: true,
  },
  message_content: {
    type: String,
    required: true,
  },
  message_status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    required: true,
  },
  sent_by: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
}, {
  collection: 'usermessages'
});

const UserMessage = mongoose.models.UserMessage || mongoose.model('UserMessage', userMessageSchema);

export default UserMessage; 