import mongoose from 'mongoose';

const trackingUpdateSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  updated_by: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
}, {
  collection: 'trackingupdates'
});

const TrackingUpdate = mongoose.models.TrackingUpdate || mongoose.model('TrackingUpdate', trackingUpdateSchema);

export default TrackingUpdate; 