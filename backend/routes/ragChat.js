// Viktor Gjorgjevski, 6/23/2025 retrieval + HF chat generation (free tier)
// Mizanur Mizan, 6/25/2025-6/26/2025 Modified llm response to not generate assistant questions, duplicate responses
// Syed Rabbey, 6/26/2025, Created toggle component for chat modes (direct and conversational).
// Violet Yousif, 6/27/2025 - Fixed the deprecated inference client import
// Viktor Gjorgjevski, 7/1/2025 Fixed issue where LLM response was including user response and replying to itself

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
      return `You are Methuselah, a friendly longevity wellness coach. 
      You are only allowed to answer as Methuselah, the coach. 
      Never create or simulate responses for the user.
      Never write a conversation, only a single, one-turn reply as Methuselah, directly to the user. 
      Stop speaking as soon as you finish your reply.
      Do not ask for or expect a user reply in your output.`;
    } else {
      // Default = Direct mode
      return `You are a longevity wellness coach named Methuselah speaking to ${username}.
      ONLY reply as the coach. Never include any role tags or generate responses as the user.
      Keep answers short, actionable, and easy to follow (max 200 words). Never cut yourself off mid-sentence.
      Wait for the user's reply before continuing.`;
    }
  }

// POST /api/ragChat
router.post('/ragChat', chatLimiter, auth(), async (req, res) => {
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
    const vagueInputs = ['help', 'help me', 'what should I do', 'idk', 'unsure', 'no idea', 'hi', 'hello', 'hey', 'thanks', 'thank you'];
    const isVague = vagueInputs.some(v => question.toLowerCase().includes(v));



    let userPrompt;
    let systemPrompt;
    // Forces the direct mode toggle to avoid knowledge base context.
    if (isVague) {
      systemPrompt = `You are Methuselah, the friendly longevity coach. ONLY speak as Methuselah. NEVER reply as the user. Greet ${firstName} and invite them to share a health or wellness goal.`;
      userPrompt = "";
      //`Greet the user as Methuselah, a wise and friendly wellness coach, and invite them to share their health goals or concerns. Only write your own reply as Methuselah.`;
    } 
    else if (!context || context.length < 20) {
      systemPrompt = "You are Methuselah, the friendly longevity coach. ONLY reply as Methuselah. NEVER reply as the user.";
      userPrompt = `If the user's question is not related to health, wellness, or longevity, politely explain you can only answer those topics. Question: ${question}`;
      }
    else if (mode === 'direct') {
      systemPrompt = buildSystemPrompt(firstName, mode);
      userPrompt = `Answer the following question as Methuselah, the longevity coach. Only reply as Methuselah. Do not simulate a conversation.\n\n${question}`;
      //userPrompt = `Answer the following question as Methuselah, the longevity coach. Only reply as Methuselah. Do not simulate a conversation.\n\n${question}`;  // Send ONLY the user question, no KB context for direct mode
    } else {
      systemPrompt = buildSystemPrompt(firstName, mode);
      userPrompt = `Here is some relevant context:\n${context}\n\nAnswer ONLY as the coach, in one turn. Do NOT generate a reply from the user. The question: ${question}`;
      //userPrompt = `Here is some relevant context:\n${context}\n\nAnswer ONLY as the coach, in one turn. Do NOT generate a reply from the user. The question: ${question}`;
    }

    //const systemPrompt = buildSystemPrompt(firstName, mode);

    // generate answer with Zephyr-7B 
    const chatResp = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        // { role: 'assistant', content: `Context:\n${context}` },
        // { role: 'user',      content: question }
        {
          role: 'user',
          content: userPrompt
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
    //const userRoleRegex = /(?:^|\n)[A-Z][a-zA-Z0-9_ ]{0,40}:/;
    //const roleMatch = answer.match(userRoleRegex);
   //if (roleMatch) {
    //answer = answer.slice(0, roleMatch.index).trim();  
    const roleOrDialogue = answer.search(/\n\s*([\/\[]|USER|METHUSALEH|COACH|PATIENT|CLIENT)/i);
    if (roleOrDialogue > 0) {
      answer = answer.slice(0, roleOrDialogue).trim(); 
  }
    answer = answer.split('\n\n')[0].trim();
    res.json({ answer, contextDocs: docs }); //Send answer + the passages we used
  } catch (err) {
    console.error('ragChat ERROR', err);
    res.status(500).json({ error: err.message || 'ragChat failed' });
  }
});

export default router;