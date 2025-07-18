// Conversation.js: defines the structure of a Conversation call in MongoDB.
// Mohammad Hoque, 7/3/2025, Removed unique constraint on userId to allow multiple conversations per user
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  title: { type: String },
  summary: {
    lastSummarizedAt: { type: Date },
    content: { type: String },
    tokenCount: { type: Number },
    embedding: { type: [Number], index: 'flat' }
  },
  messages: [{
    sender: { type: String, enum: ['user', 'AI'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema, 'Conversations');
export default Conversation;
 