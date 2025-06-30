// Violet Yousif, 6/27/2025 - Created a new test script for Q&A generation to avoid wasting tokens in the main app

///// Directions:
// To run this, verify you added the HF_API_KEY to your .env file on root directory.
// Run with: `node scripts/testQAGen.js` or `npm run dev:test`
import { InferenceClient } from '@huggingface/inference';
import { config } from 'dotenv';
import stripJsonComments from 'strip-json-comments';
import path from 'path';
import { fileURLToPath } from 'url';

config({ path: '.env.local' });

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

    // Bad key logic: this regex captures the "query" and any missing "answer" key, replacing it
    jsonLike = jsonLike.replace(
      /"query":\s*"([^"]+)",\s*"([^"]+)"\s*:\s*"([^"]+)"/g,
      (_, query, missingKey, answerText) => {
        return `"query": "${query}", "answer": "${missingKey}: ${answerText}"`;
      }
    );


  // Parsing implementation: fix missing quotes around keys
  let parsed;
  try {
    parsed = JSON.parse(jsonLike);
  } catch (jsonErr) {
    console.warn('JSON.parse failed. Attempting eval() fallback...');
    try {
      // Eval() needs to wrap in parentheses to return the object properly
      parsed = eval('(' + jsonLike + ')');
    } catch (evalErr) {
      console.error('Both JSON.parse and eval() failed:', {
        jsonError: jsonErr.message,
        evalError: evalErr.message,
        input: jsonLike.slice(0, 300) // truncate to avoid flooding logs
      });
      return []; // Skip this block
    }
  }

  if (Array.isArray(parsed)) {
    parsedArrays.push(...parsed);
  } else {
    console.warn('Parsed result is not an array. Skipping block.');
  }
  }

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
