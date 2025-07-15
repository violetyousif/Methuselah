// Violet Yousif, 7/6/2025, Added uploadData route for admin to handle file uploads for data ingestion and pretraining.

// Process files from here using chunkAndIngest.js logic
// /routes/admin/uploadData.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import {
  //loadFromURL,
  loadPDF,
  loadTXT,
  loadCSV,
  loadJSON,
  loadXLS,
  loadImageText,
  chunkText,
  embedAndStoreChunks,
  getClient
} from '../../scripts/chunkAndIngest.js';

const router = express.Router();

// Configure rate limiter: maximum of 10 requests per minute
const uploadDataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|txt|json|csv|xls|xlsx|png|jpg|jpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, JSON, CSV, XLS, XLSX, PNG, JPG, JPEG files are allowed'));
    }
  }
});

// Admin file upload endpoint
router.post('/uploadData', uploadDataLimiter, auth('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log(`[UPLOAD] File received: ${req.file?.originalname}`);
    console.log(`[UPLOAD] Stored at path: ${req.file?.path}`);

    const uploadDir = path.resolve('./uploads/');
    const filePath = fs.realpathSync(path.resolve(uploadDir, req.file.filename));
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let text = '';

    console.log(`[UPLOAD]: Processing ${fileExtension} at ${filePath}`);

    // Verify file path is within the upload directory
    if (!filePath.startsWith(uploadDir)) {
      throw new Error(`Invalid file path: ${filePath}`);
    }

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Uploaded file not found: ${filePath}`);
    }

    // Load file content based on type
    switch (fileExtension) {
      case '.pdf':
        console.log('Processing PDF file:', filePath);
        text = await loadPDF(filePath);
        break;
      case '.txt':
        console.log('Processing TXT file:', filePath);
        text = loadTXT(filePath);
        break;
      case '.json':
        console.log('Processing JSON file:', filePath);
        text = loadJSON(filePath);
        break;
      case '.csv':
        console.log('Processing CSV file:', filePath);
        text = await loadCSV(filePath);
        break;
      case '.xls':
      case '.xlsx':
        console.log('Processing XLS/X file:', filePath);
        text = await loadXLS(filePath);
        break;
      case '.png':
      case '.jpg':
      case '.jpeg':
        console.log('Processing image file:', filePath);
        text = await loadImageText(filePath);
        break;
      default:
        console.error('Unsupported file type:', fileExtension);
        throw new Error('Unsupported file type');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No content extracted from uploaded file.');
      //return res.status(400).json({ error: 'No text content found in file' });
    }

    // Chunk the text
    const chunks = chunkText(text, 500);

    // Log chunk details to console
    chunks.forEach((chunk, i) => {
      console.log(`Chunk ${i + 1}:\n${chunk}\n`);
    });

    // Embed and store chunks
    await embedAndStoreChunks(chunks, req.file.originalname);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: 'File processed successfully',
      filename: req.file.originalname,
      chunks: chunks.length,
      totalCharacters: text.length
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      const uploadDir = path.resolve('./uploads/');
      const normalizedPath = path.resolve(req.file.path);
      if (normalizedPath.startsWith(uploadDir) && fs.existsSync(normalizedPath)) {
        fs.unlinkSync(normalizedPath);
      } else {
        console.error('Invalid file path detected:', req.file.path);
      }
    }

    res.status(500).json({
      error: 'Failed to process file',
      message: error.message
    });
  }
});

export default router;
