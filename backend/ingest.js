// ingest.js  – one-time loader
// Run this file to put starter passages + their vectors into MongoDB.


// What it does
// 1. Reads secrets from .env.local   (MONGODB_URI  +  HF_API_KEY)
// 2. Connects to MongoDB Atlas  →  Longevity.KnowledgeBase
// 3. For each text snippet:
//  turns the text into a 384-number vector
//  saves { id, text, embedding } in the collection
// 4. Prints “done” and closes the DB connection.
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { MongoClient } from 'mongodb';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_KEY);
// MongoDB client to Atlas cluster
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();

const kb = client.db('Longevity').collection('KnowledgeBase');

// Text we want to load
const docs = [
  { id: 'sleep', text: 'Aim for 7–9 hours of quality sleep per night.' },
  { id: 'exercise', text: '150 minutes of moderate aerobic exercise weekly improves lifespan.' },
];

// Loop: embed + insert
for (const d of docs) {
  // create the 384-dim vector
  const emb = await hf.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: d.text,
  });
  // store in MongoDB
  await kb.insertOne({ ...d, embedding: emb });
  console.log(`Inserted "${d.id}"`);
}

await client.close();
console.log('done');
