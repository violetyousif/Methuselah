// Feeback.js: defines the structure of a Feedback call in MongoDB.
// Edited by: Viktor Gjorgjevski
// Date: 06/11/2025

import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Feedback', FeedbackSchema, 'Feedback');
