import mongoose from 'mongoose';

const failedDeliverySchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    ref: 'Consignment'
  },
  failure_reason: {
    type: String,
    required: true,
    enum: [
      'Recipient Unavailable',
      'Invalid Address',
      'Recipient Refused',
      'Delivery Time Expired',
      'Package Damaged',
      'Weather Conditions',
      'Vehicle Breakdown',
      'Other'
    ]
  },
  attempts: {
    type: Number,
    default: 1
  },
  last_attempt: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      required: true
    },
    handled_by: {
      type: String,
      required: true
    }
  },
  notes: {
    type: String
  },
  next_attempt: {
    scheduled_time: Date,
    assigned_to: {
      type: String,
      ref: 'DeliveryStaff'
    }
  },
  status: {
    type: String,
    enum: ['Pending Retry', 'Rescheduled', 'Cancelled', 'Returned to Sender'],
    default: 'Pending Retry'
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
  collection: 'FailedDeliveries',
  timestamps: true
});

// Index for faster queries
failedDeliverySchema.index({ consignment_id: 1 });
failedDeliverySchema.index({ status: 1 });
failedDeliverySchema.index({ 'next_attempt.scheduled_time': 1 });
failedDeliverySchema.index({ 'last_attempt.timestamp': -1 });

const FailedDelivery = mongoose.models.FailedDelivery || mongoose.model('FailedDelivery', failedDeliverySchema);

export default FailedDelivery; 