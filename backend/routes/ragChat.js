
// Viktor Gjorgjevski, 6/23/2025 retrieval + HF chat generation (free tier)
// Mizanur Mizan, 6/25/2025-6/26/2025 Modified llm response to not generate assistant questions, duplicate responses
// Syed Rabbey, 6/26/2025, Created toggle component for chat modes (direct and conversational).
// Violet Yousif, 6/27/2025 - Fixed the deprecated inference client import
// Viktor Gjorgjevski, 7/1/2025 Fixed issue where LLM response was including user response and replying to itself
// Viktor Gjorgjevski, 7/13/2025 Added ability to re-use chat history in responses

// What happens inside:
// 1. Embed the user’s question.
// 2. Pull the 3 most relevant KB passages + 3 personal-memory summaries.
// 3. Feed those passages + the question to the Mistral-7B model.
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

const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5'; 

const hf = new InferenceClient(process.env.HF_API_KEY);
// 100 % free chat-tuned model. IF theres a BETTER one, please change it HERE!!!
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'; // Primary model - more reliable
const FALLBACK_MODEL = 'HuggingFaceH4/zephyr-7b-beta'; // Fallback model
//const HF_MODEL = 'google/flan-t5-small';

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
  function buildSystemPrompt(username) {
    // if (mode === 'conversational') {
    //   return `You are Methuselah, a friendly longevity wellness coach. 
    //   You are only allowed to answer as Methuselah, the coach. 
    //   Never create or simulate responses for the user.
    //   Never write a conversation, only a single, one-turn reply as Methuselah, directly to the user. 
    //   Stop speaking as soon as you finish your reply.
    //   Do not ask for or expect a user reply in your output.`;
    // } else {
      // Default = Direct mode
      return `You are a wise longevity health and wellness advisor named Methuselah speaking to ${username}.
      ONLY reply as the advisor. Never include any role tags or generate responses as the user.
      Make answers conversational, actionable, and tailored to ${username}'s health metrics. Never cut yourself off mid-sentence.
      Wait for the user's reply before continuing.`
    //}
  }

router.post('/ragChat', chatLimiter, auth(), async (req, res) => {
  console.log('ragChat HIT');
  const t0 = Date.now();

  try {
    const question = req.body.query?.trim();
    if (!question) return res.status(400).json({ error: 'query required' });

    const userId = req.user.id;

    // Parallel fetch: user profile and question embedding
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

    // const isVague = ['help', 'idk', 'unsure', 'no idea', 'hi', 'hello', 'hey', 'thanks'].some(e =>
    //   question.toLowerCase().includes(e)
    // );

    let systemPrompt = buildSystemPrompt(firstName);
    let userPrompt;

    if (isVague) {
      systemPrompt = `You are Methuselah, the friendly longevity coach. Only speak as Methuselah. Never reply as the user.`;
      userPrompt = `Greet ${firstName} and invite them to share a health or wellness goal.`;
    } else if (!context || context.length < 20) {
      userPrompt = question;
    } else {
      userPrompt = `Based on the following information:\n${context}\n\nAnswer this question:\n${question}`;
    }

    const baseChatConfig = {
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      top_p: 0.95,
      min_tokens: 10,
      max_tokens: 1200,  // Increased to allow for complete responses
      options: { wait_for_model: true }
    };

    let chatResp;
    try {
      console.log('Attempting chat completion with config:', JSON.stringify(baseChatConfig, null, 2));
      chatResp = await chatCompletionWithFallback({ 
        ...baseChatConfig, options: { wait_for_model: false } });
      console.log('Chat completion response:', JSON.stringify(chatResp, null, 2));
    } catch (err) {
      if (err.message?.includes('Model loading')) {
        console.warn('Model cold-start: retrying with wait_for_model: true');
        chatResp = await chatCompletionWithFallback({ ...baseChatConfig, options: { wait_for_model: true } });
        console.log('Chat completion response (retry):', JSON.stringify(chatResp, null, 2));
      } else if (err.message?.includes('timeout')) {
        console.error('Chat completion timed out after 30 seconds');
        throw new Error('Request timed out. Please try again.');
      } else throw err;
    }

    const t3 = Date.now();

    // Better error handling for empty responses
    if (!chatResp || !chatResp.choices || !chatResp.choices[0]) {
      console.error('No response received from chat completion:', chatResp);
      // Send a fallback response instead of throwing an error
      res.json({ 
        answer: "I apologize, but I'm having trouble generating a response right now. Please try asking your question again.", 
        contextDocs: combined
      });
      return;
    }

    let answer = chatResp.choices?.[0]?.message?.content ?? '';
    console.log('Raw AI response:', answer);
    console.log('Response length:', answer.length);
    console.log('Finish reason:', chatResp.choices?.[0]?.finish_reason);
    
    // Check if answer is empty
    if (!answer || answer.trim() === '') {
      console.error('Empty answer received from chat completion');
      // Send a fallback response instead of throwing an error
      res.json({ 
        answer: "I apologize, but I'm having trouble generating a response right now. Please try asking your question again.", 
        contextDocs: combined
      });
      return;
    }
    
    // Clean up the response by removing unwanted role tags, but preserve the full content
    answer = answer
      .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|\[INST\]|\[\/INST\])\s*/i, '')
      .replace(/\n\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\])\s*/gi, '\n')
      .trim();
    
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
    
    // Check if response was truncated due to token limits
    const finishReason = chatResp.choices?.[0]?.finish_reason;
    if (finishReason === 'length') {
      console.warn('⚠️ Response was truncated due to token limit. Consider increasing max_tokens.');
      // Append a note if the response was cut off
      if (!answer.match(/[.!?]$/)) {
        answer += '...';
      }
    }

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

  
// POST /api/ragChat
// router.post('/ragChat', chatLimiter, auth, async (req, res) => {
//   console.log('ragChat HIT');
//   try {
//     //Grab and sanity-check the question
//     const question = req.body.query?.trim();
//     //const mode = req.body.mode === 'conversational' ? 'conversational' : 'direct';
//     if (!question) return res.status(400).json({ error: 'query required' });

//     // Grab user first name from MongoDB
//     const userId = req.user.id;
//     const userProfile = await vectorClient.db('Longevity').collection('Users').findOne({ _id: ObjectId.createFromHexString(userId) });
//     const firstName = userProfile?.firstName || 'traveler';

//     //Turn the question into a vector
//     const qEmb = await hf.featureExtraction({
//       //model: 'sentence-transformers/all-MiniLM-L6-v2',
//       provide: 'default', // use the default model for feature extraction
//       model: 'BAAI/bge-small-en-v1.5',
//       inputs: question,
//     });

//     //Vector search: top-4 matching passages (this is where the pretraining gets used)
//     const docs = await kb.aggregate([
//       {
//         $vectorSearch: {
//           index: 'vector_index',
//           path: 'embedding',
//           queryVector: qEmb,
//           numCandidates: 50,
//           limit: 4
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           text: 1,
//           //topic: 1,
//           source: 1
//         }
//       }
//     ]).toArray();

//     const context = docs.map(d => d.text).join('\n---\n');


  // const isVague = ['help', 'idk', 'unsure', 'no idea', 'hi', 'hello', 'hey', 'thanks'].some(e =>
  //   question.toLowerCase().includes(e)
  // );

  // let systemPrompt = buildSystemPrompt(firstName);
  // let userPrompt;

  // if (isVague) {
  //   // Greet user and invite a wellness question
  //   systemPrompt = `You are Methuselah, the friendly longevity coach. Only speak as Methuselah. Never reply as the user.`;
  //   userPrompt = `Greet ${firstName} and invite them to share a health or wellness goal.`;
  // } else if (!context || context.length < 20) {
  //   // Fallback when vector search fails
  //   userPrompt = question; // Just pass the user input
  // } else {
  //   // Provide vector-based context
  //   userPrompt = `Based on the following information:\n${context}\n\nAnswer this question:\n${question}`;
  // }

  //   // generate answer with Zephyr-7B 
  //   const chatResp = await hf.chatCompletion({
  //     model: HF_MODEL,
  //     messages: [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: userPrompt }
  //     ],
  //     max_tokens: 800,
  //     temperature: 0.2,
  //     top_p: 0.95,
  //     options: { wait_for_model: false }   // waits if model is cold
  //   });

  //   let answer = chatResp.choices?.[0]?.message?.content ?? '';
  //   answer = answer
  //     .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\])\s*/i, '')
  //     .trim();
  //   //const userRoleRegex = /(?:^|\n)[A-Z][a-zA-Z0-9_ ]{0,40}:/;
  //   //const roleMatch = answer.match(userRoleRegex);
  //  //if (roleMatch) {
  //   //answer = answer.slice(0, roleMatch.index).trim();  
  //   const roleOrDialogue = answer.search(/\n\s*([\/\[]|USER|METHUSALEH|COACH|PATIENT|CLIENT)/i);
  //   if (roleOrDialogue > 0) {
  //     answer = answer.slice(0, roleOrDialogue).trim(); 
  // }
  
  //   answer = answer.split('\n\n')[0].trim();
  //   res.json({ answer, contextDocs: docs }); //Send answer + the passages we used
  // } catch (err)
  //   console.error('RAG chat ERROR', err);
  //   res.status(500).json({ error: err.message || 'RAG chat failed' });
  // };

export default router;



// // Error handling for vague user input
    // const vagueInputs = ['help', 'help me', 'what should I do', 'idk', 'unsure', 'no idea', 'hi', 'hello', 'hey', 'thanks', 'thank you'];
    // const isVague = vagueInputs.some(v => question.toLowerCase().includes(v));
    //
    // let userPrompt;
    // let systemPrompt;
    // // Forces the direct mode toggle to avoid knowledge base context.
    // if (isVague) {
    //   systemPrompt = `You are Methuselah, the friendly longevity coach. ONLY speak as Methuselah. NEVER reply as the user. Greet ${firstName} and invite them to share a health or wellness goal.`;
    //   userPrompt = "";
    //   //`Greet the user as Methuselah, a wise and friendly wellness coach, and invite them to share their health goals or concerns. Only write your own reply as Methuselah.`;
    // } 
    // else if (!context || context.length < 20) {
    //   systemPrompt = "You are Methuselah, the friendly longevity coach. ONLY reply as Methuselah. NEVER reply as the user.";
    //   userPrompt = `If the user's question is not related to health, wellness, or longevity, politely explain you can only answer those topics. Question: ${question}`;
    //   }
    // else if (mode === 'direct') {
    //   systemPrompt = buildSystemPrompt(firstName, mode);
    //   userPrompt = `Answer the following question as Methuselah, the longevity coach. Only reply as Methuselah. Do not simulate a conversation.\n\n${question}`;
    //   //userPrompt = `Answer the following question as Methuselah, the longevity coach. Only reply as Methuselah. Do not simulate a conversation.\n\n${question}`;  // Send ONLY the user question, no KB context for direct mode
    // } else {
    //   systemPrompt = buildSystemPrompt(firstName, mode);
    //   userPrompt = `Here is some relevant context:\n${context}\n\nAnswer ONLY as the coach, in one turn. Do NOT generate a reply from the user. The question: ${question}`;
    //   //userPrompt = `Here is some relevant context:\n${context}\n\nAnswer ONLY as the coach, in one turn. Do NOT generate a reply from the user. The question: ${question}`;
    // }

    //const systemPrompt = buildSystemPrompt(firstName, mode);