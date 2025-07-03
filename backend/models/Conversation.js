// Conversation.js: defines the structure of a Conversation call in MongoDB.
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // ensures one document per user
  },
  title: { type: String },
  summary: {
    lastSummarizedAt: { type: Date },
    content: { type: String },
    tokenCount: { type: Number }
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
