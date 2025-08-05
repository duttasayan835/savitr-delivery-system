import mongoose, { Document, Schema, Model } from 'mongoose';

export enum DeliveryStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RESCHEDULED = 'rescheduled',
  OUT_FOR_DELIVERY = 'out-for-delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

export interface RescheduleEntry {
  oldDate: Date;
  oldTime: string;
  newDate: Date;
  newTime: string;
  timestamp: Date;
  reason?: string;
}

export interface IDelivery extends Document {
  trackingId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  deliveryDate: Date;
  deliveryTime: string;
  product: string;
  status: DeliveryStatus;
  recipientId?: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  rescheduleHistory: RescheduleEntry[];
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  predictedSlot?: string;
  isEligibleForReschedule(): boolean;
}

const DeliverySchema = new Schema<IDelivery>({
  trackingId: {
    type: String,
    required: [true, 'Tracking ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Recipient name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Recipient phone is required'],
    maxlength: [15, 'Phone number cannot exceed 15 characters']
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Delivery address is required']
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    get: (v: number) => v ? parseFloat(v.toFixed(13)) : v,
    set: (v: number) => v ? parseFloat(v.toFixed(13)) : v
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
    get: (v: number) => v ? parseFloat(v.toFixed(13)) : v,
    set: (v: number) => v ? parseFloat(v.toFixed(13)) : v
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required']
  },
  product: {
    type: String,
    required: [true, 'Product details are required']
  },
  status: {
    type: String,
    enum: Object.values(DeliveryStatus),
    default: DeliveryStatus.SCHEDULED
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  rescheduleHistory: [{
    oldDate: {
      type: Date,
      required: true
    },
    oldTime: {
      type: String,
      required: true
    },
    newDate: {
      type: Date,
      required: true
    },
    newTime: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String
    }
  }],
  notes: {
    type: String
  },
  predictedSlot: {
    type: String,
    required: false
  }
}, {
  collection: 'DeliveryHistory',
  timestamps: true,
  methods: {
    isEligibleForReschedule() {
      // Check if status is eligible
      const eligibleStatuses = [DeliveryStatus.SCHEDULED, DeliveryStatus.RESCHEDULED];
      if (!eligibleStatuses.includes(this.status)) {
        return false;
      }

      // Check if it's before 9:30 AM on delivery day
      const now = new Date();
      const deliveryDate = new Date(this.deliveryDate);
      const isToday = now.toDateString() === deliveryDate.toDateString();
      const cutoff = new Date(deliveryDate);
      cutoff.setHours(9, 30, 0, 0); // 9:30am

      // Allow rescheduling if:
      // 1. Delivery is in the future (not today), OR
      // 2. It's today but before 9:30 AM
      return !isToday || (isToday && now < cutoff);
    }
  }
});

// Add compound and single indexes for optimized querying
DeliverySchema.index({ status: 1, deliveryDate: 1 }); // Compound index for status + date queries
DeliverySchema.index({ adminId: 1 });
DeliverySchema.index({ recipientId: 1 });
DeliverySchema.index({ phone: 1 });
DeliverySchema.index({ deliveryDate: 1 });
DeliverySchema.index({ latitude: 1, longitude: 1 }); // Index for geospatial queries

// Generate a unique tracking ID before saving
DeliverySchema.pre('validate', async function() {
  if (this.isNew && !this.trackingId) {
    const prefix = 'SAV';
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    this.trackingId = `${prefix}${randomNum}`;

    // Check if this trackingId already exists
    const exists = await mongoose.models.Delivery?.findOne({ trackingId: this.trackingId });

    // If it exists, retry with a new random number
    if (exists) {
      const newRandomNum = Math.floor(100000000 + Math.random() * 900000000);
      this.trackingId = `${prefix}${newRandomNum}`;
    }
  }
});

// Check if we're on the server side before creating the model
let Delivery: Model<IDelivery>;

if (mongoose.models && typeof mongoose.models !== 'undefined') {
  Delivery = (mongoose.models.Delivery as Model<IDelivery>) || mongoose.model<IDelivery>('Delivery', DeliverySchema);
} else {
  // This is a placeholder for client-side
  Delivery = {} as Model<IDelivery>;
}

export default Delivery;
