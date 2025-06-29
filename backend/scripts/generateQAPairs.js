// Violet Yousif, 6/27/2025 - Created a new QA generation script using Zephyr-7B model for training data. Still working on this though.

import { InferenceClient } from '@huggingface/inference';
import { config } from 'dotenv';
import { createObjectCsvWriter } from 'csv-writer';
import { connectDB } from './lib/db.js';
import { QAPair } from './models/QAPair.js';

config({ path: '.env.local' });

const hf = new InferenceClient(process.env.HF_API_KEY);

const TOPICS = [
  "NAD+ boosters",
  "intermittent fasting",
  "sleep optimization",
  "mitochondrial health",
  "telomere lengthening",
  "metformin",
  "senolytics",
  "aging biomarkers",
  "caloric restriction",
  "cold exposure",
  "rapamycin",
  "sauna therapy",
  "longevity diet",
  "gut microbiome",
  "supplements",
  "muscle mass and aging",
  "cognitive function and aging",
  "hormone balance",
  "exercise and longevity",
  "stress and longevity",
  "skin health and aging",
  "diabetes and aging",
  "cardiovascular health and aging",
];

const SYSTEM_PROMPT = `You are a longevity and wellness expert. Create high-quality Q&A pairs. Be concise but informative. Respond in JSON format like:
[
  { "query": "...", "answer": "..." },
  ...
]`;

// Before main()
await connectDB();

(async () => {
  const allPairs = [];

  for (const topic of TOPICS) {
    const pairs = await generateQAPairs(topic, 5);
    allPairs.push(...pairs.map(p => ({ ...p, topic })));

    // Save to MongoDB
    await QAPair.insertMany(pairs.map(p => ({ ...p, topic })));
    console.log(`Saved ${pairs.length} pairs for topic "${topic}"`);
  }

  // Optionally also write CSV
  const csvWriter = createObjectCsvWriter({
    path: 'qa_training_data_zephyr.csv',
    header: [
      { id: 'query', title: 'query' },
      { id: 'answer', title: 'answer' },
      { id: 'topic', title: 'topic' }
    ]
  });

  await csvWriter.writeRecords(allPairs);
})();



async function generateQAPairs(topic, n = 5) {
  const userPrompt = `Generate ${n} realistic Q&A pairs about: "${topic}". Follow the format exactly.`;

  const response = await hf.chatCompletion({
    model: 'HuggingFaceH4/zephyr-7b-beta',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 200, // or change to 300 for more detailed answers
    temperature: 0.7,
    top_p: 0.9,
    options: { wait_for_model: true }
  });


  try {
   const raw = response.choices?.[0]?.message?.content.trim();

    // Remove Zephyr's assistant/user tags and clean up
    const cleaned = raw
        .replace(/\[.*?\]/g, '') // remove tags like [ASS], [USER], etc.
        .trim();

    // Try to extract just the JSON array
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('No JSON block found.');

    const jsonBlock = cleaned.slice(start, end + 1);

    // Optional: console.log(jsonBlock) to inspect it
    const parsed = JSON.parse(jsonBlock);

    return parsed;
  } catch (err) {
    console.error(`Failed to parse Zephyr output for topic: ${topic}`, err);
    return [];
  }
}

(async () => {
  const allPairs = [];

  for (const topic of TOPICS) {
    const pairs = await generateQAPairs(topic, 5);
    allPairs.push(...pairs);
  }

  const csvWriter = createObjectCsvWriter({
    path: 'qa_training_data_zephyr.csv',
    header: [
      { id: 'query', title: 'query' },
      { id: 'answer', title: 'answer' }
    ]
  });

  await csvWriter.writeRecords(allPairs);
  console.log(`Saved ${allPairs.length} Q&A pairs to qa_training_data_zephyr.csv`);
})();

