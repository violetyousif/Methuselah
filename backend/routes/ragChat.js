// Viktor Gjorgjevski, 6/23/2025 minimal vector-retrieval endpoint
// Violet Yousif, 6/27/2025 - Fixed the deprecated inference client import

// Steps
// 1. Embed the question with Mini-LM (Hugging Face free tier).
// 2. Ask MongoDB Vector Search for the 3 closest passages.
// 3. Return the passages + similarity scores.
import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });          

const router = Router();

// Create MongoDB and Hugging Face clients once.
// Node will reuse these for every request (better performance).
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const kb  = client.db('Longevity').collection('KnowledgeBase');
const hf  = new InferenceClient({ apiKey: process.env.HF_API_KEY });

//POST /api/ragSearch
router.post('/ragSearch', async (req, res) => {
  try {
    // Get the user’s question
    const question = req.body.query?.trim();
    if (!question) return res.status(400).json({ error: 'query required' });

    // Turn question into a vector (384 numbers)
    const qEmb = await hf.featureExtraction({
      //model: 'sentence-transformers/all-MiniLM-L6-v2',
      provide: 'default',                // use the default model for feature extraction
      model: 'BAAI/bge-small-en-v1.5',   // faster and more accurate embedding model
      inputs: question,
    });

    // Ask MongoDB for the 3 most similar passages
    const hits = await kb.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',   // name we gave the Vector Search index
          path: 'embedding', // field that stores each chunk’s vector
          queryVector: qEmb,  // vector of the question
          numCandidates: 50,  // how many docs to scan internally
          limit: 3  // final results returned
        }
      },
      { // keep only the fields we want to send back
        $project: {
          _id: 0,
          id: 1,
          text: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();
    // Send the passages 
    res.json({ matches: hits });
  } catch (err) {
    console.error('vector search error', err);
    res.status(500).json({ error: 'vector search failed' });
  }
});

export default router;