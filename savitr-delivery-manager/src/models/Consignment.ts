import mongoose from 'mongoose';

const consignmentSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    unique: true
  },
  sender_name: {
    type: String,
    required: true
  },
  sender_phone: {
    type: String,
    required: true
  },
  sender_address: {
    type: String,
    required: true
  },
  receiver_name: {
    type: String,
    required: true
  },
  receiver_phone: {
    type: String,
    required: true
  },
  receiver_address: {
    type: String,
    required: true
  },
  parcel_type: {
    type: String,
    required: true,
    enum: ['Speed Post', 'Regular', 'Express', 'Premium']
  },
  date_of_booking: {
    type: Date,
    required: true,
    default: Date.now
  },
  delivery_status: {
    type: String,
    required: true,
    enum: ['Item Booked', 'In Transit', 'Delivered', 'Failed'],
    default: 'Item Booked'
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
  collection: 'ConsignmentTable',
  timestamps: true
});

// Generate consignment_id before saving
consignmentSchema.pre('validate', function(next) {
  if (this.isNew && !this.consignment_id) {
    const prefix = 'SAV';
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    this.consignment_id = `${prefix}${randomNum}`;
  }
  next();
});

const Consignment = mongoose.models.Consignment || mongoose.model('Consignment', consignmentSchema);

export default Consignment; 