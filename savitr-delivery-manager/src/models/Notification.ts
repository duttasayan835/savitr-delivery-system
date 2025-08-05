import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    ref: 'Consignment'
  },
  to: {
    type: String,
    required: true,
    enum: ['sender', 'receiver', 'admin', 'staff']
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Status Update',
      'Delivery Scheduled',
      'Delivery Attempted',
      'Delivery Failed',
      'Delivery Successful',
      'Feedback Request',
      'System Alert',
      'Custom Message'
    ]
  },
  content: {
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed', 'Read'],
    default: 'Pending'
  },
  delivery_channels: [{
    type: String,
    enum: ['SMS', 'Email', 'Push', 'In-App'],
    required: true
  }],
  sent: {
    type: Boolean,
    default: false
  },
  sent_at: Date,
  read_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: Date
}, {
  collection: 'Notifications',
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ consignment_id: 1 });
notificationSchema.index({ to: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ expires_at: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification; 