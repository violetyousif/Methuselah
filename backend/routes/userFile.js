import { Router } from 'express';
import multer from 'multer';
import UserFile from '../models/UserFile.js';
import auth from '../middleware/auth.js';
import { extractTextFromFile } from '../utils/extractTextFromFile.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each user/IP to 5 uploads per windowMs
  message: 'Too many uploads from this IP, please try again after 15 minutes.'
});

/* ----------  POST /uploadFile  ---------- */
router.post(
  '/uploadFile',
  (req, res, next) => { 
    console.log('[UPLOAD] Cookies:', req.cookies); // <--- ADD THIS LINE
    next(); 
  },
  (req, res, next) => { console.log('[LOG] HIT: Before Auth'); next(); },
  auth,
  (req, res, next) => { console.log('[LOG] HIT: After Auth'); next(); },
  fileUploadLimiter,
  (req, res, next) => { console.log('[LOG] HIT: After Rate Limit'); next(); },
  upload.single('file'),
  (req, res, next) => { console.log('[LOG] HIT: After Multer'); next(); },
  async (req, res) => {
    console.log('[LOG] UPLOAD ROUTE HIT', new Date());
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

      const userId = req.user.id;
      const { originalname, mimetype, buffer, size } = req.file;

      // Extract text AFTER receiving the file
      const extractedText = await extractTextFromFile(buffer, mimetype, originalname);

      // Save to MongoDB
      const fileDoc = new UserFile({
        user: userId,
        fileName: req.file.filename || originalname,
        originalName: originalname,
        fileType: mimetype,
        fileSize: size,
        uploadedAt: new Date(),
        fileContent: buffer,
        extractedText,
      });

      await fileDoc.save();
      res.json({ fileId: fileDoc._id, fileName: originalname, fileType: mimetype });
    } catch (err) {
      console.error('File upload error:', err);
      res.status(500).json({ error: err.message || 'File upload failed' });
    }
  }
);

/* ----------  GET /my-files  ---------- */
const myFilesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user/IP to 10 requests per windowMs
  message: 'Too many requests to fetch files, please try again after 15 minutes.'
});

router.get('/my-files', auth, myFilesLimiter, async (req, res) => {
  try {
    const userId = req.user.id;

    // Only send metadata the UI needs (no binary data)
    const files = await UserFile.find({ user: userId })
      .select('_id originalName uploadedAt fileType fileSize')
      .sort({ uploadedAt: -1 });

    res.json({ files });
  } catch (err) {
    console.error('Fetch user files error:', err);
    res.status(500).json({ error: 'Could not load files' });
  }
});

export default router;
