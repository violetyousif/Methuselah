// Conversation.js: defines the structure of a Conversation call in MongoDB.
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  summary: {
    lastSummarizedAt: Date,
    content: String,
    tokenCount: Number
  },
  messages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
    sender: { type: String, enum: ['user', 'AI'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Conversation', ConversationSchema, 'Conversations');
