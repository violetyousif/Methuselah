import mongoose from 'mongoose';

const UserFileSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:  { type: String, required: true },
  originalName: { type: String, required: true },
  fileType:  { type: String, required: true },
  fileSize:  { type: Number, required: true },
  uploadedAt:{ type: Date, default: Date.now },
  fileContent: { type: Buffer, required: true }, // For small files (PDF/TXT/CSV, <16MB)
  extractedText: { type: String }, // For LLM use (optional, can add later)
});

const UserFile = mongoose.model('UserFile', UserFileSchema, 'UserFiles');
export default UserFile;
