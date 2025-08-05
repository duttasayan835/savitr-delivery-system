import mongoose from 'mongoose';

const deliveryHistorySchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    ref: 'Consignment'
  },
  event: {
    type: String,
    required: true,
    enum: [
      'Item Booked',
      'Dispatched from Origin PO',
      'Received at Origin MPC',
      'In Transit',
      'Received at Destination MPC',
      'Received at Delivery PO',
      'Out for Delivery',
      'Delivered',
      'Delivery Failed',
      'Rescheduled',
      'Cancelled'
    ]
  },
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
  },
  notes: {
    type: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  collection: 'DeliveryHistory',
  timestamps: true
});

// Index for faster queries
deliveryHistorySchema.index({ consignment_id: 1, timestamp: -1 });
deliveryHistorySchema.index({ event: 1, timestamp: -1 });

const DeliveryHistory = mongoose.models.DeliveryHistory || mongoose.model('DeliveryHistory', deliveryHistorySchema);

export default DeliveryHistory; 