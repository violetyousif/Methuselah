// Messsage.js: defines the structure of a Message call in MongoDB.
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  sender: { type: String, enum: ['user', 'AI'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema, 'Messages');