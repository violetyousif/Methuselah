// HealthMetric.js: defines the structure of a HealthMetric call in MongoDB.
import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number },
  sleepHours: { type: Number },
  activityLevel: { type: String },
  lastUpdated: { type: Date },
  source: { type: String, default: 'profile' }
});

export default mongoose.model('HealthMetric', HealthMetricSchema, 'HealthMetrics'); // 'HealthMetrics' collection in MongoDB
export { HealthMetricSchema }; 