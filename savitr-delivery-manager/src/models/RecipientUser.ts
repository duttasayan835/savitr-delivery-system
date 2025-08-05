import mongoose from 'mongoose';
import { generateUserId } from '@/lib/mongodb';

interface IRecipientUser extends mongoose.Document {
  name: string;
  phone: string;
  email?: string;
  address: string;
  otp?: string;
  otpExpiry?: Date;
  otpAttempts: number;
  last_login?: Date;
  userId?: string;
}

const recipientUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true }, // Make email optional but still unique when provided
  address: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  last_login: { type: Date },
  userId: { type: String }
}, {
  collection: 'recipientusers' // Explicitly set the collection name
});

// Generate userId before saving if not provided
recipientUserSchema.pre('save', function(this: IRecipientUser, next) {
  if (!this.userId) {
    this.userId = generateUserId(this.phone);
  }
  next();
});

// Create and export the model
const RecipientUser = mongoose.models.RecipientUser || mongoose.model<IRecipientUser>('RecipientUser', recipientUserSchema);

export default RecipientUser; 