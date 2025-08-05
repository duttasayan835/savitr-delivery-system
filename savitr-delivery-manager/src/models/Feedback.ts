import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  consignment_id: {
    type: String,
    required: true,
    ref: 'Consignment'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    required: true
  },
  submitted_by: {
    type: String,
    required: true,
    enum: ['sender', 'receiver']
  },
  categories: [{
    type: String,
    enum: [
      'Delivery Speed',
      'Staff Behavior',
      'Package Condition',
      'Communication',
      'Overall Experience'
    ]
  }],
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  is_public: {
    type: Boolean,
    default: false
  },
  admin_response: {
    response: String,
    responded_by: String,
    responded_at: Date
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
  collection: 'Feedback',
  timestamps: true
});

// Index for faster queries
feedbackSchema.index({ consignment_id: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ sentiment: 1 });
feedbackSchema.index({ created_at: -1 });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 