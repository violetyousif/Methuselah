// Violet Yousif, 7/6/2025, Added uploadData route for admin to handle file uploads for data ingestion and pretraining.

// Process files from here using chunkAndIngest.js logic
// /routes/admin/uploadData.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import auth from '../../middleware/auth.js';
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
router.post('/uploadData', auth('admin'), upload.single('file'), async (req, res) => {
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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to process file',
      message: error.message
    });
  }
});

export default router;



// import express from 'express';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs-extra';
// import { fileURLToPath } from 'url';
// import auth from '../../middleware/auth.js';
// import {
//   loadFromURL,
//   loadPDF,
//   loadTXT,
//   loadCSV,
//   loadJSON,
//   loadXLS,
//   loadImageText,
//   chunkText,
//   embedAndStoreChunks,
//   client
// } from '../../scripts/chunkAndIngest.js';

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Store files temporarily in /uploads
// const uploadDir = path.join(__dirname, '../../scripts/uploads');
// fs.ensureDirSync(uploadDir);
// const upload = multer({ dest: uploadDir });

// // Route: POST /api/admin/uploadData
// router.post('/uploadData', auth('admin'), upload.single('file'), async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

//   const filePath = req.file.path;
//   const originalName = req.file.originalname;
//   const ext = path.extname(originalName).toLowerCase();

//   try {
//     let fullText = '';

//     switch (ext) {
//       case '.pdf':
//         fullText = await loadPDF(filePath);
//         break;
//       case '.txt':
//         fullText = await loadTXT(filePath);
//         break;
//       case '.json':
//         fullText = await loadJSON(filePath);
//         break;
//       case '.csv':
//         fullText = await loadCSV(filePath);
//         break;
//       case '.xls':
//       case '.xlsx':
//         fullText = await loadXLS(filePath);
//         break;
//       case '.png':
//       case '.jpg':
//       case '.jpeg':
//         fullText = await loadImageText(filePath);
//         break;
//       default:
//         return res.status(400).json({ message: `Unsupported file type: ${ext}` });
//     }

//     const chunks = chunkText(fullText, 500);
//     await embedAndStoreChunks(chunks, originalName);
//     await client.close();

//     res.status(200).json({
//       message: 'File uploaded and ingested successfully',
//       chunks: chunks.length
//     });

//     // Optional: auto-trigger QA pair generation from fullText + topic
//     // (you can import that logic from gemTestQAGen.js later if desired)

//   } catch (err) {
//     console.error('Upload processing error:', err.message || err);
//     res.status(500).json({ message: 'File processing failed', error: err.message });
//   } finally {
//     fs.remove(filePath); // Clean up uploaded temp file
//   }
// });

// export default router;
