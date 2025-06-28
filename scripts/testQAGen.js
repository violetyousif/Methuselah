// Violet Yousif, 6/27/2025 - Created a new test script for Q&A generation to avoid wasting tokens in the main app

///// Directions:
// To run this, verify you added the HF_API_KEY to your .env file on root directory.
// Run with: `node scripts/testQAGen.js`
import { InferenceClient } from '@huggingface/inference';
import { config } from 'dotenv';
import stripJsonComments from 'strip-json-comments';

config();

const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY || typeof HF_API_KEY !== 'string') {
  throw new Error('HF_API_KEY is missing or invalid in .env file.');
}

console.log('HF_API_KEY loaded. Starting test...');
const hf = new InferenceClient(HF_API_KEY);

// Constants for the test and topic
// Adjust these as needed for your specific test case
const TEST_TOPIC = 'intermittent fasting';
const SYSTEM_PROMPT = `You are a longevity and wellness expert. Create short, clear health Q&A pairs. Format your output as a JSON array:
[
  { "query": "...", "answer": "..." },
  ...
]`;

const MAX_TOKENS = 200;

//// Helper function to attempt to fix and parse the JSON format output from the model
function attemptToFixAndParse(raw) {
  const arrayRegex = /\[\s*{[\s\S]*?}\s*\]/g;
  const matches = raw.match(arrayRegex);

  if (!matches || matches.length === 0) {
    throw new Error('No JSON array blocks found.');
  }

  const parsedArrays = [];

  for (const block of matches) {
    let jsonLike = block;

    // Clean comments, spacing, trailing commas
    jsonLike = stripJsonComments(jsonLike)
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ');

    // Fix bad formatted Q&A: no "answer" key
    jsonLike = jsonLike.replace(
      /("query":\s*"[^"]*")\s*,\s*"([^"]+)":\s*"([^"]*)"/g,
      (_, query, badKey, answer) => `${query}, "answer": "${badKey}: ${answer}"`
    ).replace(
      /("query":\s*"[^"]*")\s*,\s*"([^"]+)"/g,
      (_, query, answer) => `${query}, "answer": "${answer}"`
    );

    // Fix missing quotes around keys
    try {
      const parsed = JSON.parse(jsonLike);
      parsedArrays.push(...parsed); // Merge into one array
    } catch (e) {
      // If parsing fails, log the error but continue processing
      console.warn('SKIPPING INVALID JSON BLOCK:', e.message);
    }
  }

  if (parsedArrays.length === 0) throw new Error('No valid Q&A blocks were parsed.');

  return parsedArrays;
}


//// Function to test the Q&A generation
async function testQAGeneration() {
  try {

    // Prepare the messages for the chat completion request
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate 2 Q&A pairs about: "${TEST_TOPIC}"` }
    ];

    // Estimate token usage to avoid exceeding limits
    const approxInputTokens = messages.reduce((sum, msg) => sum + msg.content.split(' ').length, 0);
    const estimatedTotal = approxInputTokens + MAX_TOKENS;
    console.log(`Estimated input tokens: ~${approxInputTokens}`);
    console.log(`Max output tokens allowed: ${MAX_TOKENS}`);
    console.log(`Estimated total tokens used: ~${estimatedTotal}`);

    // Check if estimated total exceeds a reasonable limit
    if (estimatedTotal > 300) {
      throw new Error('Token usage too high for testing. Lower your message content or output size.');
    }

    // Make the chat completion request to the model
    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      top_p: 0.9,
      options: { wait_for_model: true }
    });

    // Log the raw response from the model
    const raw = response.choices?.[0]?.message?.content.trim();
    console.log(`\nRaw output from Zephyr:\n${raw}`);

    // Attempt to fix and parse the JSON block
    let parsed;
    try {
      parsed = attemptToFixAndParse(raw);
    } catch (err) {
      console.error('Could not fix and parse JSON block.');
      return;
    }

    // Log the parsed Q&A pairs
    console.log(`\nParsed ${parsed.length} Q&A pairs:`);
    parsed.forEach((pair, i) => {
    console.log(`\nQ${i + 1}: ${pair.query}\nA${i + 1}: ${pair.answer}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testQAGeneration();
