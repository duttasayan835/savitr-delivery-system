import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  RECIPIENT = 'recipient'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  adminSecretCode?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.RECIPIENT
  },
  phone: {
    type: String,
    required: function() {
      return this.role === UserRole.ADMIN;
    },
    match: [
      /^[6-9]\d{9}$/,
      'Please provide a valid Indian phone number'
    ],
    unique: true,
    sparse: true,
    index: true
  },
  address: {
    type: String,
    default: null
  },
  adminSecretCode: {
    type: String,
    required: function() {
      return this.role === UserRole.ADMIN;
    },
    validate: {
      validator: function(value: string) {
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        return value === process.env.ADMIN_SECRET_CODE;
      },
      message: 'Invalid admin secret code'
    },
    select: false
  }
}, {
  timestamps: true
});

// Add compound index for role
UserSchema.index({ role: 1 });

// Hash the password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if we're on the server side before creating the model
let User: Model<IUser>;

if (mongoose.models && typeof mongoose.models !== 'undefined') {
  User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
} else {
  // This is a placeholder for client-side
  User = {} as Model<IUser>;
}

export default User;
