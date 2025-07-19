// /routes/admin/manageChunks.js
// Mohammad Hoque, 07/18/2025, Admin route to manage chunks (view, edit, delete)
import express from 'express';
import RateLimit from 'express-rate-limit';
import auth from '../../middleware/auth.js';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();

// MongoDB connection
const vectorClient = new MongoClient(process.env.MONGODB_URI);

// Define rate limiter: max 100 requests per 15 minutes
const manageChunksLimiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests to /chunks. Please try again later."
});

// GET all chunks
router.get('/chunks', manageChunksLimiter, auth('admin'), async (req, res) => {
  try {
    const chunks = await vectorClient.db('Longevity').collection('KnowledgeBase').find({}).toArray();
    
    // Map the database fields to frontend expected fields
    const mappedChunks = chunks.map(chunk => ({
      _id: chunk._id,
      content: chunk.text || chunk.content || '',
      source: chunk.source || '',
      topic: chunk.topic || chunk.metadata?.topic || 'General',
      hash: chunk.hash,
      timestamp: chunk.timestamp,
      embedding: chunk.embedding
    }));
    
    res.status(200).json(mappedChunks);
  } catch (err) {
    console.error('Error fetching chunks:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// PATCH (update) a specific chunk
router.patch('/chunks/:id', manageChunksLimiter, auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the id param (security purposes)
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid chunk id.' });
    }
    
    // Map frontend fields to database fields
    // const updateData = {
    //   ...otherData,
    //   text: content || undefined, // Map content -> text
    //   source: source || undefined,
    //   topic: topic || undefined,
    //   updatedAt: new Date()
    // };

    const { content, source, topic } = req.body;
    const updateData = {};
    if (content !== undefined) updateData.text = content;
    if (source !== undefined) updateData.source = source;
    if (topic !== undefined) updateData.topic = topic;
    updateData.updatedAt = new Date();
    
    
    // Remove undefined values
    // Object.keys(updateData).forEach(key => 
    //   updateData[key] === undefined && delete updateData[key]
    // );
    
    const result = await vectorClient.db('Longevity').collection('KnowledgeBase').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Chunk not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Chunk updated successfully'
    });
  } catch (err) {
    console.error('Error updating chunk:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// DELETE multiple chunks
router.delete('/chunks', manageChunksLimiter, auth('admin'), async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: 'Invalid ids provided' });
    }

    const objectIds = ids.map(id => new ObjectId(id));
    
    const result = await vectorClient.db('Longevity').collection('KnowledgeBase').deleteMany({
      _id: { $in: objectIds }
    });

    res.status(200).json({ 
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} chunks`
    });
  } catch (err) {
    console.error('Error deleting chunks:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

export default router;
