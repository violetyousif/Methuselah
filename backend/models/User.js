// User.js: defines the structure of a User call in MongoDB.
// Viktor Gjorgjevski, 6/3/2025, added profilePic to User schema
// Mohammad Hoque, 6/13/2025 — Added health-related profile fields for Profile page support
// Violet Yousif, 6/16/2025, added health-related fields to User schema, fixed required values, and added missing fields.

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNum:  { type: String, required: false },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, required: false },
  profilePic: { type: String, default: '/avatars/avatar1.png' },
  agreedToTerms: { type: Boolean, default: false, required: true },
  // Health-related fields for profile data (add to table):
  age: { type: Number },
  weight: { type: Number }, // kg --> change to lbs
  height: { type: Number }, // cm --> change to ft or inches
  activityLevel: { type: String, enum: ['sedentary', 'moderate', 'active'], default: 'moderate' },
  sleepHours: { type: Number, default: 8 },
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

