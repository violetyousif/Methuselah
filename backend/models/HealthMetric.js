//  Mizanur Mizan, 07/02/2025, Added new fields for mood, brekfast, lunch, dinner

// backend/models/HealthMetric.js
// HealthMetric.js: defines the structure of a HealthMetric call in MongoDB.
import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // ensures one document per user
    ref: 'User'
  },
  dates: {
    type: Map,
    of: new mongoose.Schema({
      sleepHours: { type: Number, required: true },
      exerciseHours: { type: Number, required: true },
      mood: { type: String, default: '' },
      weight: { type: Number, default: 0 },
      calories: { type: Number, required: true }
    }, { _id: false })}
  },
  { timestamps: true // Adds createdAt and updatedAt
    //collection: 'HealthMetrics'
});

const HealthMetric = mongoose.models.HealthMetric || mongoose.model('HealthMetric', HealthMetricSchema, 'HealthMetrics');
export default HealthMetric;
