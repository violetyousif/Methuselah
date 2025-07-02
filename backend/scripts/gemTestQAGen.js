// Violet Yousif, 6/28/2025 - Updated the test script to use Gemini API for Q&A generation, added error handling and JSON parsing improvements.

///// Directions:
// To run this, verify you added the GEMINI_API_KEY to your .env.local file on root directory.
// Run with: `node scripts/gemTestQAGen.js` or `npm run dev:gemtest`
import { config } from 'dotenv';
import stripJsonComments from 'strip-json-comments';
import { connectDB } from './lib/db.js';
import { QAPair } from './models/QAPairs.js';
import fs from 'fs-extra';
import path from 'path';

config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY || typeof GEMINI_API_KEY !== 'string') {
    throw new Error('GEMINI_API_KEY is missing or invalid in .env file.');
}

// Constants for the test and topic
// Adjust these as needed for your specific test case
const TEST_TOPIC = 'Mitochondrial health and longevity';
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
        // jsonLike = jsonLike.replace(
        //     /"query":\s*"([^"]+)",\s*"([^"]+)"\s*:\s*"([^"]+)"/g,
        //     (_, query, missingKey, answerText) => {
        //         return `"query": "${query}", "answer": "${missingKey}: ${answerText}"`;
        //     }
        // );

        // Parsing implementation: fix missing quotes around keys
        let parsed;
        try {
            parsed = JSON.parse(jsonLike);
        } catch (jsonErr) {
            console.warn('JSON.parse failed. Attempting eval() fallback...');
            try {
                parsed = eval('(' + jsonLike + ')');
            } catch (evalErr) {
                console.error('Both JSON.parse and eval() failed:', {
                    jsonError: jsonErr.message,
                    evalError: evalErr.message,
                    input: jsonLike.slice(0, 300) // truncate to avoid flooding logs
                });
                continue; // Skip this block
            }
        }

        if (Array.isArray(parsed)) {
            parsedArrays.push(...parsed);
        } else {
            console.warn('Parsed result is not an array. Skipping block.');
        }
    }
    return parsedArrays;
}

async function saveToDBAndJSON(pairs, topic = TEST_TOPIC) {
    await connectDB();

    const withTopic = pairs.map(p => ({
        query: p.query.trim(),
        answer: p.answer.trim(),
        topic: topic.trim()
    }));

    const uniquePairs = [];

    for (const pair of withTopic) {
        const exists = await QAPair.exists({
            query: pair.query,
            answer: pair.answer,
            topic: pair.topic
        });
        if (!exists) {
            uniquePairs.push(pair);
        }
    }

    if (uniquePairs.length === 0) {
        console.log('No new Q&A pairs to insert — all were duplicates.');
    } else {
        await QAPair.insertMany(uniquePairs);
        console.log(`Inserted ${uniquePairs.length} new Q&A pairs into MongoDB.`);
    }

    // Check JSON file duplicates before writing
    const outputPath = path.resolve(`qaTestOutput.json`);

    let existingJSON = [];

    if (await fs.pathExists(outputPath)) {
        existingJSON = await fs.readJSON(outputPath);
    }

    // Remove any already existing entries (based on query + answer + topic)
    const deduplicated = uniquePairs.filter((pair) => {
        return !existingJSON.some(prev =>
            prev.query === pair.query &&
            prev.answer === pair.answer &&
            prev.topic === pair.topic
        );
    });

    if (deduplicated.length === 0) {
        console.log('All new entries already existed in previous JSON file — not writing any.');
    } else {
        const updatedOutput = [...existingJSON, ...deduplicated];
        // Save all (including duplicates) to JSON file for audit
        await fs.writeJSON(outputPath, updatedOutput, { spaces: 2 });
        console.log(`Saved ${deduplicated.length} new Q&A pairs to qa_test_output.json`);
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
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: `Generate 2 Q&A pairs about: "${TEST_TOPIC}". Format them as a JSON array of objects with 'query' and 'answer' fields.`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Parse the response JSON
        const json = await response.json();
        const raw = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!raw) throw new Error('No content returned from Gemini API');
        console.log(`\nRaw output from Gemini:\n${raw}`);    // Log the raw response from the model

        // Attempt to fix and parse the JSON block
        const parsed = attemptToFixAndParse(raw);
        if (!parsed || parsed.length === 0) {
            console.warn('No valid Q&A pairs to save.');
            return;
        }

        // Log the parsed Q&A pairs
        console.log(`\nParsed ${parsed.length} Q&A pairs:`);
        parsed.forEach((pair, i) => {
            console.log(`\nQ${i + 1}: ${pair.query}\nA${i + 1}: ${pair.answer}`);
        });
        await saveToDBAndJSON(parsed, TEST_TOPIC);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testQAGeneration();