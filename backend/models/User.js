// User.js: defines the structure of a User call in MongoDB.
// Viktor Gjorgjevski, 6/3/2025, added profilePic to User schema
// Mohammad Hoque, 6/13/2025 — Added health-related profile fields for Profile page support

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  walletAddress: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  phoneNum:  { type: String },
  dateOfBirth: { type: String, required: true },
  gender: { type: String,required: true },
  profilePic: { type: String, default: '/avatars/avatar1.png' },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  activityLevel: { type: String, enum: ['sedentary', 'moderate', 'active'] },
  sleepHours: { type: Number },

  agreedToTerms: { type: Boolean, default: false, required: true },
  preferences: {
    theme: { type: String, default: 'default' },
    aiMode: { type: String, default: 'short' },
    tone: { type: String, default: 'neutral' },
    fontSize: { type: String, default: 'regular' },
    notificationsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const getUser = mongoose.model('User', UserSchema, 'Users');
export default getUser;

