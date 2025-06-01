const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: String },
  country: { type: String },
  preferences: {
    theme: { type: String, default: 'default' },
    aiMode: { type: String, default: 'short' },
    tone: { type: String, default: 'neutral' },
    fontSize: { type: String, default: 'regular' },
    notificationsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema, 'Users');
// This schema defines the structure of a User document in MongoDB.