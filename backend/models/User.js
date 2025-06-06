// User.js: defines the structure of a User call in MongoDB.
//Edited by Viktor Gjorgjevski 6/3/2025
//-added profilePic to User schema
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNum:  { type: String },
  dateOfBirth: { type: String, required: true },
  gender: { type: String,required: true },
  profilePic: { type: String, default: '/avatars/avatar1.png' },
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

