// Viktor Gjorgjevski, 6/23/2025 retrieval + HF chat generation (free tier)
// Mizanur Mizan, 6/25/2025-6/26/2025 Modified llm response to not generate assistant questions, duplicate responses
// Syed Rabbey, 6/26/2025, Created toggle component for chat modes (direct and conversational).
// Violet Yousif, 6/27/2025 - Fixed the deprecated inference client import


// What happens inside:
// 1. Embed the user’s question.
// 2. Pull the 4 most relevant passages from KnowledgeBase.
// 3. Feed those passages + the question to the free Zephyr-7B chat model.
// 4. Return the model’s answer and the passages we used.
import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import auth from '../middleware/auth.js';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 20,                  
  message: 'Too many chat requests from this IP. Please slow down and try again later.',
});

const router = Router();

// Re-use a single Mongo connection + HF client for speed
const vectorClient = new MongoClient(process.env.MONGODB_URI);
await vectorClient.connect();
const kb = vectorClient.db('Longevity').collection('KnowledgeBase');

const hf = new InferenceClient(process.env.HF_API_KEY);
// 100 % free chat-tuned model. IF theres a BETTER one, please change it HERE!!!
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

// Helper builds the system instruction for the LLM
// Each mode has a different prompt to guide the LLM's behavior
  function buildSystemPrompt(username, mode) {
    if (mode === 'conversational') {
      return `You are a warm, friendly longevity wellness coach talking to ${username}.
  You enjoy storytelling, elaboration, and conversational style responses.
  Refer to ${username} by name occasionally.
  Be detailed and human-like, even if it takes several paragraphs.`;
    } else {
      // Default = Direct mode
      return `You are a longevity wellness coach speaking to ${username}.
  Do not include any role tags like USER:, ASSISTANT:, [USER], or [ASSISTANT] in your responses.
  Occasionally include ${username}'s name in your replies for personalization.
  Keep answers short, actionable, and easy to follow, no more than 200 words. Do not cut yourself off mid-sentence.`;
    }
  }

// POST /api/ragChat
router.post('/ragChat', chatLimiter, auth, async (req, res) => {
  console.log('ragChat HIT');
  try {
    //Grab and sanity-check the question
    const question = req.body.query?.trim();
    const mode = req.body.mode === 'conversational' ? 'conversational' : 'direct';
    if (!question) return res.status(400).json({ error: 'query required' });

    // Grab user first name from MongoDB
    const userId = req.user.id;
    const userProfile = await vectorClient.db('Longevity').collection('Users').findOne({ _id: ObjectId.createFromHexString(userId) });
    const firstName = userProfile?.firstName || 'traveler';

    //Turn the question into a vector
    const qEmb = await hf.featureExtraction({
      //model: 'sentence-transformers/all-MiniLM-L6-v2',
      provide: 'default', // use the default model for feature extraction
      model: 'BAAI/bge-small-en-v1.5',
      inputs: question,
    });

    //Vector search: top-4 matching passages
    const docs = await kb.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: qEmb,
          numCandidates: 50,
          limit: 4
        }
      },
      { $project: { _id: 0, text: 1 } }
    ]).toArray();

    const context = docs.map(d => d.text).join('\n---\n');

    // Error handling for vague user input
    const vagueInputs = ['help', 'help me', 'what should I do', 'idk', 'unsure', 'no idea'];
    const isVague = vagueInputs.some(v => question.toLowerCase().includes(v));

    let userPrompt;
    // Forces the direct mode toggle to avoid knowledge base context.
    if (isVague) {
      userPrompt = `The user (${firstName}) is unsure what they need help with. Politely ask which specific area they want help with (examples: sleep, stress, exercise, supplements).`;
    } else if (mode === 'direct') {
      userPrompt = `${question}`;  // Send ONLY the user question, no KB context for direct mode
    } else {
      userPrompt = `Here is some relevant context:\n${context}\n\nBased on this, answer ${firstName}'s question as a longevity wellness coach.`;
    }

    const systemPrompt = buildSystemPrompt(firstName, mode);

    // generate answer with Zephyr-7B 
    const chatResp = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        // { role: 'assistant', content: `Context:\n${context}` },
        // { role: 'user',      content: question }
        {
          role: 'user',
          content: `Here is some relevant context:\n${context}\n\nBased on this, answer the following question:\n${question}`
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
      top_p: 0.95,
      options: { wait_for_model: true }   // waits if model is cold
    });

    let answer = chatResp.choices?.[0]?.message?.content ?? '';
    answer = answer
      .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\])\s*/i, '')
      .trim();
    res.json({ answer, contextDocs: docs }); //Send answer + the passages we used
  } catch (err) {
    console.error('ragChat ERROR', err);
    res.status(500).json({ error: err.message || 'ragChat failed' });
  }
});

export default router;
