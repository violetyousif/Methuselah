// /routes/admin/uploadURL.js
import express from 'express';
import auth from '../../middleware/auth.js';
import {
    loadFromURL,
    chunkText,
    embedAndStoreChunks,
    cleanText
} from '../../scripts/chunkAndIngest.js';

const router = express.Router();

router.post('/uploadURL', auth('admin'), async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    try {
        const text = await loadFromURL(url);
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'No extractable text from URL.' });
        }

        const cleaned = cleanText(text);
        const chunks = chunkText(cleaned);
        await embedAndStoreChunks(chunks, url);

        res.json({
            message: 'URL processed successfully',
            source: url,
            chunks: chunks.length,
            totalCharacters: text.length
        });
    } catch (err) {
        console.error('URL ingestion error:', err.message);
        res.status(500).json({ error: 'Failed to process URL', message: err.message });
    }
});

export default router;
