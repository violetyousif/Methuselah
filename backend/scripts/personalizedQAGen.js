// scripts/personalizedQAGen.js
import { InferenceClient } from '@huggingface/inference';
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env.local' });

const HF_API_KEY = process.env.HF_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'Methuselah';
const COLLECTION_NAME = 'Users';

const hf = new InferenceClient(HF_API_KEY);
const client = new MongoClient(MONGODB_URI);

async function getUserProfile(userId) {
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  const profile = await collection.findOne({ userId });
  await client.close();
  return profile;
}

function buildSystemPrompt(profile) {
  return `You are a wellness AI advisor.
Personalize your responses using the following user profile:
- Age: ${profile.age}
- Goals: ${profile.healthGoals.join(', ')}
- Diet: ${profile.preferences.diet}

Respond concisely with helpful, context-aware health advice.`;
}

async function askPersonalizedQuestion(userId, question) {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error('User profile not found.');

  const messages = [
    { role: 'system', content: buildSystemPrompt(profile) },
    { role: 'user', content: question }
  ];

  const response = await hf.chatCompletion({
    model: 'HuggingFaceH4/zephyr-7b-beta',
    messages,
    max_tokens: 200,
    temperature: 0.7,
    top_p: 0.9,
    options: { wait_for_model: true }
  });

  return response.choices?.[0]?.message?.content.trim();
}

// For manual test
if (require.main === module) {
  askPersonalizedQuestion('user_1234', 'Is green tea good for me?')
    .then(res => console.log('\nPersonalized AI Response:\n', res))
    .catch(console.error);
}

export default askPersonalizedQuestion;
