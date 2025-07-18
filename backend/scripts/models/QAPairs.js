// Violet Yousif, 07/03/2025, created model type to define the QAPair model for MongoDB using Mongoose

import mongoose from 'mongoose';

const QAPairSchema = new mongoose.Schema({
  query: String,
  answer: String,
  topic: String,
  createdAt: { type: Date, default: Date.now }
});

export const QAPair = mongoose.models.QAPair || mongoose.model('QAPair', QAPairSchema);
