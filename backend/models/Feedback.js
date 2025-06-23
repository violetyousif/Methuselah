// Feeback.js: defines the structure of a Feedback call in MongoDB.
import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Feedback', FeedbackSchema, 'Feedback');