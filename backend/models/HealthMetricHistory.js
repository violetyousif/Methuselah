// Syed Rabbey, 6/30/2025, Created HealthMetricHistory model for time-series tracking of user health metrics to support dashboard insights and audit trail.

// HealthMetricHistory.js: Audit trail for time-series tracking of user health metric changes
import mongoose from 'mongoose';

const HealthMetricHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metric: { type: String, required: true },                  // Example: 'weight', 'sleepHours', 'activityLevel'
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Supports both numbers (weight) and strings (activityLevel)
  unit: { type: String },                                     // Example: 'lbs', 'hours'
  recordedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'profile' }
});

export default mongoose.model('HealthMetricHistory', HealthMetricHistorySchema, 'HealthMetricsHistory'); // Collection = HealthMetricsHistory
export { HealthMetricHistorySchema };
