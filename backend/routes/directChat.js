// Mohammad Hoque, 6/29/2025 - Created direct chat mode built on top of ragChat.js

import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import auth from '../middleware/auth.js';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 20,                  
  message: 'Too many direct chat requests from this IP. Please slow down and try again later.',
});

const router = Router();

// Re-use a single Mongo connection + HF client for speed
const vectorClient = new MongoClient(process.env.MONGODB_URI);
await vectorClient.connect();
const kb = vectorClient.db('Longevity').collection('KnowledgeBase');

const hf = new InferenceClient(process.env.HF_API_KEY);
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

// Helper function to build concise system prompt for direct mode
function buildDirectSystemPrompt(userData) {
  const { firstName, age, weight, height, gender, activityLevel, sleepHours } = userData;
  
  // Build health context for personalization but keep it concise
  let healthContext = `\nUser Profile for ${firstName}:`;
  
  if (age) healthContext += `\n- Age: ${age}`;
  if (weight && height) {
    const bmi = (weight / ((height/100) ** 2)).toFixed(1);
    healthContext += `\n- BMI: ${bmi}`;
  }
  if (gender) healthContext += `\n- Gender: ${gender}`;
  if (activityLevel) healthContext += `\n- Activity: ${activityLevel}`;
  if (sleepHours) healthContext += `\n- Sleep: ${sleepHours}h/night`;

  return `You are Methuselah, a direct and efficient longevity coach speaking directly with ${firstName}.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
- You are having a REAL conversation with ${firstName}, not writing a script or example
- NEVER write "USER:", "ASSISTANT:", "COACH:", or any dialogue tags
- NEVER write example conversations or hypothetical dialogues
- NEVER ask questions - only provide complete advice and guidance
- Speak DIRECTLY to ${firstName} as if you're giving them immediate guidance

RESPONSE STYLE FOR DIRECT MODE:
- Be concise and to-the-point (aim for 50-150 words maximum)
- Provide clear, actionable advice without unnecessary elaboration
- Use bullet points or numbered lists when appropriate
- Focus on immediate, practical steps
- Be professional but still personalized to ${firstName}'s profile
- Reference their health data when relevant to make advice specific
- End with a clear next action, not questions
- NEVER write fake conversations or dialogue examples

MANDATORY HEALTH PERSONALIZATION:
- Start by acknowledging ${firstName}'s specific health situation
- Reference their actual health metrics in your advice
- Make direct connections between their data and your recommendations${healthContext}

EXAMPLE OF CORRECT STYLE (notice NO dialogue tags, direct address):
"${firstName}, with your ${userData.activityLevel || 'current activity level'} lifestyle and ${userData.age ? `at age ${userData.age}` : 'at your stage of life'}, here's what you need to focus on..."

FORBIDDEN - NEVER DO THIS:
- "USER: What about sleep?"
- "ASSISTANT: Great question!"
- "Here's a sample conversation..."
- Any form of dialogue or script writing

Remember: You are speaking DIRECTLY to ${firstName} right now. This is real advice, not an example.`;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Helper function to validate and trim response length for direct mode
function validateResponseLength(answer, mode, maxWords = null) {
  const words = answer.split(' ').length;
  const maxWordsLimit = maxWords || (mode === 'direct' ? 150 : 200);
  
  if (words > maxWordsLimit) {
    // Find the last complete sentence within the limit
    const sentences = answer.split(/[.!?]+/);
    let trimmedAnswer = '';
    let wordCount = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(' ').length;
      if (wordCount + sentenceWords <= maxWordsLimit) {
        trimmedAnswer += sentence + '.';
        wordCount += sentenceWords;
      } else {
        break;
      }
    }
    
    return trimmedAnswer.trim() || answer.substring(0, maxWordsLimit * 5); // Fallback
  }
  
  return answer;
}

// POST /api/directChat
router.post('/directChat', chatLimiter, auth, async (req, res) => {
  console.log('directChat HIT');
  try {
    // Grab and sanity-check the question
    const question = req.body.query?.trim();
    if (!question) return res.status(400).json({ error: 'query required' });

    // Grab user profile and health data from MongoDB
    const userId = req.user.id;
    const userProfile = await vectorClient.db('Longevity').collection('Users').findOne({ 
      _id: ObjectId.createFromHexString(userId) 
    });
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Prepare user data for personalization
    const userData = {
      firstName: userProfile.firstName || 'user',
      age: calculateAge(userProfile.dateOfBirth),
      weight: userProfile.weight,
      height: userProfile.height,
      gender: userProfile.gender,
      activityLevel: userProfile.activityLevel,
      sleepHours: userProfile.sleepHours
    };

    // Turn the question into a vector for knowledge base search
    const qEmb = await hf.featureExtraction({
      provide: 'default',
      model: 'BAAI/bge-small-en-v1.5',
      inputs: question,
    });

    // Vector search: top-3 matching passages from knowledge base (fewer for direct mode)
    const docs = await kb.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: qEmb,
          numCandidates: 30,
          limit: 3
        }
      },
      { $project: { _id: 0, text: 1 } }
    ]).toArray();

    const context = docs.map(d => d.text).join('\n---\n');

    // Handle vague user input with direct guidance
    const vagueInputs = ['help', 'help me', 'what should I do', 'idk', 'unsure', 'no idea'];
    const isVague = vagueInputs.some(v => question.toLowerCase().includes(v));

    let userPrompt;
    if (isVague) {
      const priorities = [];
      if (userData.sleepHours < 7) priorities.push('sleep improvement');
      if (userData.activityLevel === 'sedentary') priorities.push('exercise routine');
      if (userData.age >= 40) priorities.push('nutrition optimization');
      if (priorities.length === 0) {
        priorities.push('sleep', 'exercise', 'nutrition');
      }
      
      userPrompt = `${userData.firstName} needs direct guidance on health priorities. 
      Based on their profile: age ${userData.age || 'not specified'}, activity: ${userData.activityLevel || 'not specified'}, sleep: ${userData.sleepHours || 'not specified'}h/night, BMI: ${userData.weight && userData.height ? (userData.weight / ((userData.height/100) ** 2)).toFixed(1) : 'not calculated'}
      
      CRITICAL: You are speaking DIRECTLY to ${userData.firstName} right now.
      - Start with "${userData.firstName}, based on your health profile..."
      - Reference their specific health data
      - Give 2-3 specific steps they can take immediately
      - Explain why this matters for their situation
      - NEVER write dialogue tags or example conversations
      - Keep it under 100 words and end with a clear next action.`;
    } else {
      userPrompt = `Context from knowledge base:
${context}

${userData.firstName} is asking: "${question}"

CRITICAL INSTRUCTIONS:
1. You are speaking DIRECTLY to ${userData.firstName} right now - this is NOT a script
2. Start with "${userData.firstName}, with your health profile..."
3. Reference their actual data: age: ${userData.age || 'not specified'}, activity: ${userData.activityLevel || 'not specified'}, sleep: ${userData.sleepHours || 'not specified'}h/night, BMI: ${userData.weight && userData.height ? (userData.weight / ((userData.height/100) ** 2)).toFixed(1) : 'not calculated'}
4. NEVER write "USER:" or "ASSISTANT:" tags
5. NEVER write example conversations
6. Keep under 150 words
7. Provide 2-3 clear action steps
8. End with one specific next action

Make it specifically relevant to their health profile.`;
    }

    const systemPrompt = buildDirectSystemPrompt(userData);

    // Generate direct answer with Zephyr-7B
    const chatResp = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 250, // Shorter for direct mode
      temperature: 0.05, // Very low for predictable output
      top_p: 0.6, // More focused output
      repetition_penalty: 1.3, // Higher penalty to prevent repetitive patterns
      stop: ['USER:', 'ASSISTANT:', 'COACH:', '[COACH]', '[USER]', '[ASSISTANT]', 'USER', 'ASSISTANT', 'COACH'], // Stop on script markers
      options: { wait_for_model: true }
    });

    let answer = chatResp.choices?.[0]?.message?.content ?? '';
    
    // SUPER AGGRESSIVE CLEANING - Remove ALL script-like content
    answer = answer
      .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|Methuselah:)\s*/i, '')
      .replace(/\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|Methuselah:)\s*$/i, '')
      .trim();
    
    // Remove ALL forms of dialogue tags and script markers
    answer = answer
      .replace(/\b(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI):\s*/gi, '')
      .replace(/\[(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI)\]/gi, '')
      .replace(/^\s*-\s*(User|Assistant|Coach|Client|Person|Methuselah|Bot|AI):/gim, '')
      .replace(/\*\*(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI)\*\*:?/gi, '')
      .replace(/\*\*(You|Me|I):\*\*/gi, '')
      .replace(/\n(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI):\s*/gi, '\n')
      .replace(/\n\*\*(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI)\*\*:?\s*/gi, '\n');
    
    // Remove script-like phrases that indicate fake conversations
    answer = answer
      .replace(/here's what i might say/gi, '')
      .replace(/for example, i could tell you/gi, '')
      .replace(/here's a sample conversation/gi, '')
      .replace(/you might ask me/gi, '')
      .replace(/if you were to ask/gi, '')
      .replace(/a typical conversation might go/gi, '')
      .replace(/here's how i would respond/gi, '')
      .replace(/let me give you an example/gi, 'Here\'s what you need to know')
      .replace(/imagine this conversation/gi, '')
      .replace(/picture this scenario/gi, 'Consider this situation');
    
    // Remove ANY questions and question-like phrases
    const sentences = answer.split(/[.!?]+/);
    const filteredSentences = sentences.filter(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return false;
      
      // Remove sentences with question marks
      if (trimmed.includes('?')) return false;
      
      // Remove sentences that sound like questions without question marks
      const lowerTrimmed = trimmed.toLowerCase();
      const questionPhrases = [
        'would you', 'do you', 'can you', 'are you', 'will you', 'have you',
        'what do', 'how do', 'when do', 'where do', 'why do',
        'what are', 'how are', 'when are', 'where are', 'why are',
        'what would', 'how would', 'when would', 'where would', 'why would',
        'are you ready', 'ready to', 'interested in learning',
        'want to know', 'curious about', 'wondering if'
      ];
      
      return !questionPhrases.some(phrase => lowerTrimmed.includes(phrase));
    });
    
    answer = filteredSentences.join('. ').trim();
    
    // Ensure proper ending
    if (answer && !answer.match(/[.!]$/)) {
      answer += '.';
    }
    
    // Final cleanup - remove any remaining script artifacts
    answer = answer
      .replace(/\n\s*\n/g, '\n') // Remove double line breaks
      .replace(/^\s*[-*]\s*/gm, '') // Remove bullet points that might indicate scripts
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Ensure we have a valid response
    if (!answer) {
      answer = `I apologize, ${userData.firstName}, but I encountered an issue generating a response. Please rephrase your question.`;
    }

    // Validate and trim response length for direct mode
    answer = validateResponseLength(answer, 'direct');

    res.json({ 
      answer, 
      contextDocs: docs,
      mode: 'direct',
      personalizedFor: userData.firstName 
    });
    
  } catch (err) {
    console.error('directChat ERROR', err);
    res.status(500).json({ error: err.message || 'directChat failed' });
  }
});

export default router;
