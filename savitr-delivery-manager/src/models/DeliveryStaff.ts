import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryStaffSchema = new mongoose.Schema({
  staff_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  assigned_area: {
    type: String,
    required: true
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    }
  },
  availability: {
    type: String,
    enum: ['Available', 'On Delivery', 'Off Duty', 'On Leave'],
    default: 'Available'
  },
  current_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  active_deliveries: [{
    consignment_id: {
      type: String,
      ref: 'Consignment'
    },
    status: {
      type: String,
      enum: ['Assigned', 'In Progress', 'Completed', 'Failed']
    },
    assigned_at: Date,
    completed_at: Date
  }],
  performance_metrics: {
    total_deliveries: {
      type: Number,
      default: 0
    },
    successful_deliveries: {
      type: Number,
      default: 0
    },
    failed_deliveries: {
      type: Number,
      default: 0
    },
    average_rating: {
      type: Number,
      default: 0
    }
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'DeliveryStaff',
  timestamps: true
});

// Index for faster queries
deliveryStaffSchema.index({ assigned_area: 1 });
deliveryStaffSchema.index({ 'contact.phone': 1 });
deliveryStaffSchema.index({ 'contact.email': 1 });
deliveryStaffSchema.index({ availability: 1 });
deliveryStaffSchema.index({ 'current_location.coordinates': '2dsphere' });

const DeliveryStaff = mongoose.models.DeliveryStaff || mongoose.model('DeliveryStaff', deliveryStaffSchema);

export default DeliveryStaff; 