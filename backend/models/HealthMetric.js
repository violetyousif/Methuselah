const mongoose = require('mongoose');

const HealthMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metric: { type: String, required: true }, // e.g., "sleep", "exercise"
  value: { type: Number, required: true },
  unit: { type: String }, // optional: e.g. "lbs", "hours"
  recordedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthMetric', HealthMetricSchema, 'HealthMetrics');
// This schema defines the structure of a HealthMetric document in MongoDB.