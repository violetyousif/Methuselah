
// Viktor Gjorgjevski, 6/23/2025 retrieval + HF chat generation (free tier)
// Mizanur Mizan, 6/25/2025-6/26/2025 Modified llm response to not generate assistant questions, duplicate responses
// Syed Rabbey, 6/26/2025, Created toggle component for chat modes (direct and conversational).
// Violet Yousif, 6/27/2025 - Fixed the deprecated inference client import
// Viktor Gjorgjevski, 7/1/2025 Fixed issue where LLM response was including user response and replying to itself
// Viktor Gjorgjevski, 7/13/2025 Added ability to re-use chat history in responses

// What happens inside:
// 1. Embed the user’s question.
// 2. Pull the 3 most relevant KB passages + 3 personal-memory summaries.
// 3. Feed those passages + the question to the LLM model.
// 4. Return the answer and the passages used.
import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import auth from '../middleware/auth.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

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

// The embedding model is used to embed the user's question to be sent to the vector search
const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5'; 

// The inference client is used to call the Hugging Face API for chat completions
const hf = new InferenceClient(process.env.HF_API_KEY);

// Declae Gemini API key for chat completions
const GEMINI_MODEL = process.env.GEMINI_API_KEY;
if (!GEMINI_MODEL || typeof GEMINI_MODEL !== 'string') {
    throw new Error('GEMINI_API_KEY is missing or invalid in .env file.');
}

// The primary model is used for chat completions, with a fallback model in case of failure
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';  // Primary model - more reliable
const FALLBACK_MODEL = 'HuggingFaceH4/zephyr-7b-beta';  // Fallback model



// Add this helper at the top of your file
async function geminiChatCompletion(systemPrompt, userPrompt) {
  const prompt = `${systemPrompt}\n\n${userPrompt}`;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_MODEL}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    }
  );
  if (!response.ok) throw new Error(`Gemini API error! status: ${response.status}`);
  const json = await response.json();
  const answer = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!answer) throw new Error('No content returned from Gemini API');
  return answer;
}


// Timeout wrapper for chat completion 30000
const chatCompletionWithTimeout = async (config, timeoutMs = Number(process.env.HF_TIMEOUT_MS) || 60000 ) => 
  {
  return Promise.race([
    hf.chatCompletion(config),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Chat completion timeout')), timeoutMs)
    )
  ]);
};

// Chat completion with fallback model
const chatCompletionWithFallback = async (config) => {
  try {
    console.log('Attempting chat completion with primary model:', config.model);
    return await chatCompletionWithTimeout(config);
  } catch (err) {
    console.warn('Primary model failed, trying fallback model:', err.message);
    const fallbackConfig = { ...config, model: FALLBACK_MODEL };
    return await chatCompletionWithTimeout(fallbackConfig);
  }
};

// Helper builds the system instruction for the LLM
// Each mode has a different prompt to guide the LLM's behavior
function buildSystemPrompt(username, userProfile) {
  // Calculate user's age from date of birth
  let age = '';
  if (userProfile && userProfile.dateOfBirth) {
    const dob = new Date(userProfile.dateOfBirth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
  }

  let healthProfile = '';
  if (userProfile) {
    healthProfile = `
    User Health Profile:
    - Health Goal: ${userProfile.healthGoal || 'Not specified'}
    - Supplements: ${userProfile.supplements || 'None'}
    - Medicine: ${userProfile.medicine || 'None'}
    - Activity Level: ${userProfile.activityLevel || 'Not specified'}
    - Height (inches): ${userProfile.heightInches || 'Not specified'}
    - Gender: ${userProfile.gender || 'Not specified'}
    - Age: ${age || 'Not specified'}
    `;
  }
  return `You are Methuselah, a wise and mystical advisor on longevity, health, and wellness, speaking to ${username}.
    Your words should carry the weight of ancient wisdom and a gentle, mystical presence. Make it sound very slightly poetic. Don't use too many metaphors or similes.
    ONLY reply as Methuselah. Never include any role tags or generate responses as the user.
    Make answers conversational, actionable, and tailored to ${username}'s health metrics and personal health profile. Never cut yourself off mid-sentence.
    Wait for the user's reply before continuing.
    ${healthProfile}`.trim();
  }


router.post('/ragChat', chatLimiter, auth(), async (req, res) => {
  console.log('ragChat HIT');
  const t0 = Date.now();

  try {
    const question = req.body.query?.trim();
    if (!question) return res.status(400).json({ error: 'query required' });

    const userId = req.user.id;

    // Parallel fetch: user profile and question embedding
    // Uses the user's ID to fetch their profile and embed the question
    // and stores the results in qEmb
    const [userProfile, qEmb] = await Promise.all([
      vectorClient.db('Longevity').collection('Users').findOne({ _id: ObjectId.createFromHexString(userId) }),
      hf.featureExtraction({
        model: EMBEDDING_MODEL,
        inputs: question,
      })
    ]);
    const t1 = Date.now();

    const firstName = userProfile?.firstName || 'traveler';

    // Vector search with smaller candidate pool
    const docs = await kb.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: qEmb,
          numCandidates: 30,
          limit: 3,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          source: 1,
        },
      },
    ]).toArray();

    // Retrieves user's personal memory summaries from the Conversations collection
    const memDocs = await vectorClient
      .db('Longevity')
      .collection('Conversations')
      .aggregate([
       {
        $vectorSearch: {
          index: 'vector_index',
          path: 'summary.embedding',
          queryVector: qEmb,
          numCandidates: 100,
          limit: 10
        }
      },
      {
        $match: { userId: ObjectId.createFromHexString(userId), 'summary.embedding': { $exists: true } }
      },
      {
       $project: {
         _id: 0,
         text: '$summary.content',
          source: 'personal'
       }
      }
    ])
    .toArray();


  console.log('Full memDocs:', JSON.stringify(memDocs, null, 2));

  console.log(
  '*** memDocs returned ***',
  memDocs.map(d => ({
    preview: d.text.slice(0, 60) + '…',
    _score: d._additional?.score   
    }))
  );

  const t2 = Date.now();
    const combined = [...memDocs, ...docs];
    
    // Build context (~1000-token budget) from personal memories + KB passages
    let context = '';
    let tokenBudget = 1000;
    for (const doc of combined) {
      const clean = doc.text.slice(0, 512);
      const tokens = clean.split(' ').length;
      if (tokenBudget - tokens > 0) {
        context += clean + '\n---\n';
        tokenBudget -= tokens;
      } else break;
    }

    console.log('Vector context:\n', context);
    console.log('User Question:', question);

    const vagueTerms = ['help', 'idk', 'unsure', 'no idea', 'hi', 'hello', 'hey', 'thanks'];
    const isVague = vagueTerms.includes(question.trim().toLowerCase());

    let systemPrompt = buildSystemPrompt(firstName, userProfile);   // Build system prompt based on user health profile
    let userPrompt;

    if (isVague) {
      systemPrompt = `You are Methuselah, the friendly longevity coach. Only speak as Methuselah. Never reply as the user.`;
      userPrompt = `Greet ${firstName} and invite them to share a health or longevity wellness goal.`;
    } else if (!context || context.length < 20) {
      userPrompt = question;
    } else {
      userPrompt = `The following knowledge may guide your answer:\n${context}\n\n${question}`;
    }


  let answer;
  try {
    console.log('Attempting Gemini chat completion...');
    console.log('systemPrompt:', systemPrompt);
    console.log('userPrompt:', userPrompt);
    answer = await geminiChatCompletion(systemPrompt, userPrompt);
    console.log('Gemini chat completion response:', answer);
  } catch (err) {
    if (err.message?.includes('timeout')) {
      console.error('Gemini Chat completion timed out');
      res.status(500).json({ error: err.message || 'Chat completion timed out. Please try again.' });
      return;
    } else {
      console.error('Error:', err);
      res.status(500).json({ error: err.message || 'Gemini chat failed' });
      return;
    }
  }

  // Now answer is a string, so you can keep your cleanup and response logic:
  if (!answer || answer.trim() === '') {
    res.json({ 
      answer: "I truly apologize, it appears I'm having trouble generating a response right now. Please try asking your question again.", 
      contextDocs: combined
    });
    return;
  }

  // ...cleanup and send as before...
  answer = answer
    .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|\[INST\]|\[\/INST\])\s*/i, '')
    .replace(/\n\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\])\s*/gi, '\n')
    .trim();

  res.json({ answer, contextDocs: combined });

  const t3 = Date.now();

    
    // Only truncate if there's clear dialogue or user simulation (more restrictive)
    const strongDialoguePattern = /\n\s*(USER:|PATIENT:|CLIENT:|Human:|\[USER\])/i;
    const dialogueMatch = answer.search(strongDialoguePattern);
    if (dialogueMatch > 0) {
      answer = answer.slice(0, dialogueMatch).trim();
      console.log('Truncated response due to dialogue pattern');
    }
    
    // Don't truncate on paragraph breaks - preserve the full response
    console.log('Final processed response:', answer);
    console.log('Final response length:', answer.length);
    
    // Send to client
    res.json({ answer, contextDocs: combined });

    // Performance logs
    console.log('--- RAG Chat Performance ---');
    console.log('Embed/User Fetch:', t1 - t0, 'ms');
    console.log('Vector Search    :', t2 - t1, 'ms');
    console.log('LLM Generation   :', t3 - t2, 'ms');
    console.log('Total Time       :', t3 - t0, 'ms');
    console.log('----------------------------');

  } catch (err) {
    console.error('RAG chat ERROR', err);
    res.status(500).json({ error: err.message || 'RAG chat failed' });
  }
});
export default router;
