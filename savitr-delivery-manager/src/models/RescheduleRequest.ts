import mongoose from 'mongoose';

const rescheduleRequestSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    ref: 'Consignment'
  },
  new_date: {
    type: Date,
    required: true
  },
  new_time: {
    type: String,
    required: true
  },
  requested_by: {
    type: String,
    required: true,
    enum: ['sender', 'receiver']
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  handled_by: {
    type: String,
    ref: 'AdminUser'
  },
  handled_at: Date,
  response_notes: String,
  previous_schedule: {
    date: Date,
    time: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'RescheduleRequests',
  timestamps: true
});

// Index for faster queries
rescheduleRequestSchema.index({ consignment_id: 1 });
rescheduleRequestSchema.index({ status: 1 });
rescheduleRequestSchema.index({ new_date: 1 });
rescheduleRequestSchema.index({ created_at: -1 });

const RescheduleRequest = mongoose.models.RescheduleRequest || mongoose.model('RescheduleRequest', rescheduleRequestSchema);

export default RescheduleRequest; 