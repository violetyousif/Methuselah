// Viktor Gjorgjevski, 07/14/2025 Created new helper to assist in using old chat history info in new chats

// PURPOSE: Summarise and embed the last 20 messages of a conversation
// utils/summariseAndEmbed.js
import { InferenceClient } from '@huggingface/inference';

const hf               = new InferenceClient(process.env.HF_API_KEY);
const EMBEDDING_MODEL  = 'BAAI/bge-small-en-v1.5';
const SUMMARISER_MODEL = 'sshleifer/distilbart-cnn-12-6';  

export const summariseAndEmbed = async (conversation) => {
  // last ~20 turns, newest first → oldest
  const text = conversation.messages
    .slice(-20)
    .filter(m => !/^Methuselah\b|^Greetings\b/i.test(m.text))
    .reverse()
    .map(m => `${m.sender}: ${m.text}`)
    .join('\n');

  /* 1️  Summarise */
  let summary = '';
  try {
    const resp = await hf.summarization({
      model: SUMMARISER_MODEL,
      inputs: text,
      parameters: { min_length: 60, max_length: 200 }
    });
    summary = resp.summary_text.trim();
  } catch (e) {
    console.warn('🟡 summariser failed:', e.message);
    summary = text.slice(0, 1000);          
  }

  /* 2️  Embed */
  let embedding = [];
  try {
    embedding = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: summary
    });
  } catch (e) {
    console.warn('🟠 embedding failed:', e.message);
  }

  console.log('***** summary snippet:', summary.slice(0, 80));
  console.log('***** embedding length:', embedding.length);

  return { summary, embedding, tokens: summary.split(' ').length };
};


