//  Mizanur Mizan, 07/02/2025, Added new fields for mood, brekfast, lunch, dinner

// HealthMetric.js: defines the structure of a HealthMetric call in MongoDB.
import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  // metric: { type: String, required: true }, // e.g., "sleep", "exercise"
  // date: { type: Date, required: true }, // only 1 entry per day per user
  // sleepHours: { type: Number },
  // exerciseHours: { type: Number },
  // calories: { type: Number },
  // value: { type: Number, required: true },
  // unit: { type: String }, // optional: e.g. "lbs", "hours"
  // updatedAt: { type: Date, default: Date.now }
  { timestamps: true // <-- Adds createdAt and updatedAt
    //collection: 'HealthMetrics'
});

// HealthMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

const HealthMetric = mongoose.models.HealthMetric || mongoose.model('HealthMetric', HealthMetricSchema, 'HealthMetrics');
export default HealthMetric;
// export default mongoose.model('HealthMetric', HealthMetricSchema, 'HealthMetrics');
