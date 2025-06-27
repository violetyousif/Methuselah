// Viktor Gjorgjevski, 6/23/2025 retrieval + HF chat generation (free tier)


// What happens inside:
// 1. Embed the user’s question.
// 2. Pull the 4 most relevant passages from KnowledgeBase.
// 3. Feed those passages + the question to the free Zephyr-7B chat model.
// 4. Return the model’s answer and the passages we used.
import { Router } from 'express';
import { MongoClient } from 'mongodb';
import { HfInference } from '@huggingface/inference';
import 'dotenv/config';

const router = Router();

// Re-use a single Mongo connection + HF client for speed
const vectorClient = new MongoClient(process.env.MONGODB_URI);
await vectorClient.connect();
const kb = vectorClient.db('Longevity').collection('KnowledgeBase');

const hf = new HfInference(process.env.HF_API_KEY);
// 100 % free chat-tuned model. IF theres a BETTER one, please change it HERE!!!
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

// Helper builds the system instruction for the LLM
function buildSystemPrompt() {
  return 'You are a longevity coach who answers in 3–4 concise sentences.';
}

// POST /api/ragChat
router.post('/ragChat', async (req, res) => {
  console.log('🔵  ragChat hit');
  try {
    //Grab and sanity-check the question
    const question = req.body.query?.trim();
    if (!question) return res.status(400).json({ error: 'query required' });

    //Turn the question into a vector
    const qEmb = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
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

    // generate answer with Zephyr-7B 
    const chatResp = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system',    content: buildSystemPrompt() },
        { role: 'assistant', content: `Context:\n${context}` },
        { role: 'user',      content: question }
      ],
      max_tokens: 256,
      temperature: 0.2,
      top_p: 0.95,
      options: { wait_for_model: true }   // waits if model is cold
    });

    const answer = chatResp.choices?.[0]?.message?.content ?? '';
    res.json({ answer, contextDocs: docs }); //Send answer + the passages we used
  } catch (err) {
    console.error('🔴 ragChat error', err);
    res.status(500).json({ error: err.message || 'ragChat failed' });
  }
});

export default router;
