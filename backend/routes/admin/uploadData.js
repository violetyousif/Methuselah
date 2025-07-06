// Violet Yousif, 7/6/2025, Added uploadData route for admin to handle file uploads for data ingestion and pretraining.

// Process files from here using chunkAndIngest.js logic
// /routes/admin/uploadData.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import auth from '../../middleware/auth.js';
import {
  loadFromURL,
  loadPDF,
  loadTXT,
  loadCSV,
  loadJSON,
  loadXLS,
  loadImageText,
  chunkText,
  embedAndStoreChunks,
  client
} from '../../scripts/chunkAndIngest.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store files temporarily in /uploads
const uploadDir = path.join(__dirname, '../../scripts/uploads');
fs.ensureDirSync(uploadDir);
const upload = multer({ dest: uploadDir });

// Route: POST /api/admin/uploadData
router.post('/uploadData', auth('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const ext = path.extname(originalName).toLowerCase();

  try {
    let fullText = '';

    switch (ext) {
      case '.pdf':
        fullText = await loadPDF(filePath);
        break;
      case '.txt':
        fullText = await loadTXT(filePath);
        break;
      case '.json':
        fullText = await loadJSON(filePath);
        break;
      case '.csv':
        fullText = await loadCSV(filePath);
        break;
      case '.xls':
      case '.xlsx':
        fullText = await loadXLS(filePath);
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
        fullText = await loadImageText(filePath);
        break;
      default:
        return res.status(400).json({ message: `Unsupported file type: ${ext}` });
    }

    const chunks = chunkText(fullText, 500);
    await embedAndStoreChunks(chunks, originalName);
    await client.close();

    res.status(200).json({
      message: 'File uploaded and ingested successfully',
      chunks: chunks.length
    });

    // Optional: auto-trigger QA pair generation from fullText + topic
    // (you can import that logic from gemTestQAGen.js later if desired)

  } catch (err) {
    console.error('Upload processing error:', err.message || err);
    res.status(500).json({ message: 'File processing failed', error: err.message });
  } finally {
    fs.remove(filePath); // Clean up uploaded temp file
  }
});

export default router;
