// Mohammad Hoque, 6/29/2025 - Created conversational chat mode with personalized health data integration built on top of ragChat.js

import { Router } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { InferenceClient } from '@huggingface/inference';
import auth from '../middleware/auth.js';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 20,                  
  message: 'Too many conversational chat requests from this IP. Please slow down and try again later.',
});

const router = Router();

// Re-use a single Mongo connection + HF client for speed
const vectorClient = new MongoClient(process.env.MONGODB_URI);
await vectorClient.connect();
const kb = vectorClient.db('Longevity').collection('KnowledgeBase');

const hf = new InferenceClient(process.env.HF_API_KEY);
const HF_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

// Helper function to build personalized system prompt for conversational mode
function buildConversationalSystemPrompt(userData) {
  const { firstName, age, weight, height, gender, activityLevel, sleepHours } = userData;
  
  // Build detailed health insights for personalization
  let personalizedContext = `\n\nPersonalized Health Profile for ${firstName}:`;
  let personalizedGuidance = '';
  
  if (age) {
    personalizedContext += `\n- Age: ${age} years old`;
    if (age < 30) {
      personalizedGuidance += `\n- Focus on building healthy habits early for long-term longevity`;
    } else if (age >= 30 && age < 50) {
      personalizedGuidance += `\n- Prime time for optimizing metabolic health and preventing age-related decline`;
    } else if (age >= 50) {
      personalizedGuidance += `\n- Focus on maintaining muscle mass, bone density, and cognitive function`;
    }
  }
  
  if (weight && height) {
    const bmi = (weight / ((height/100) ** 2)).toFixed(1);
    personalizedContext += `\n- Physical: ${weight}kg, ${height}cm (BMI: ${bmi})`;
    if (bmi < 18.5) {
      personalizedGuidance += `\n- Consider weight gain strategies focusing on muscle building`;
    } else if (bmi > 25) {
      personalizedGuidance += `\n- Focus on sustainable weight management through nutrition and exercise`;
    }
  }
  
  if (gender) {
    personalizedContext += `\n- Gender: ${gender}`;
    if (gender.toLowerCase() === 'female') {
      personalizedGuidance += `\n- Consider female-specific health factors like hormonal changes and bone health`;
    }
  }
  
  if (activityLevel) {
    personalizedContext += `\n- Activity Level: ${activityLevel}`;
    if (activityLevel === 'sedentary') {
      personalizedGuidance += `\n- Gradually increase movement and physical activity for better health outcomes`;
    } else if (activityLevel === 'very active') {
      personalizedGuidance += `\n- Focus on recovery, proper nutrition, and avoiding overtraining`;
    }
  }
  
  if (sleepHours) {
    personalizedContext += `\n- Sleep Pattern: ${sleepHours} hours per night`;
    if (sleepHours < 7) {
      personalizedGuidance += `\n- Prioritize improving sleep duration and quality for optimal health`;
    } else if (sleepHours > 9) {
      personalizedGuidance += `\n- Monitor sleep quality and consider underlying health factors`;
    }
  }

  return `I am Methuselah speaking directly to ${firstName}. This is a real conversation, not a roleplay or script.

ABSOLUTE RULES - NO EXCEPTIONS:
- I speak as myself, Methuselah, directly to ${firstName}
- I NEVER use tags like "COACH:", "USER:", "ASSISTANT:", or any brackets
- I NEVER write example conversations or sample dialogues  
- I NEVER ask questions or prompt for responses
- I NEVER summarize what ${firstName} said - I respond to them directly
- I start my response immediately with advice, not with restating their question
- I reference ${firstName}'s health data in my first sentence

MY SPEAKING STYLE:
- Warm, caring mentor speaking directly to ${firstName}
- I use "you" when addressing ${firstName}, never "the user" 
- I provide complete guidance without needing follow-up
- I tell stories and use analogies to make points memorable
- I end with encouragement and clear next steps

${firstName}'S HEALTH PROFILE - I MUST REFERENCE THIS:${personalizedContext}${personalizedGuidance}

CORRECT EXAMPLE: "${firstName}, with your current sleep pattern of ${userData.sleepHours || 'limited'} hours and ${userData.activityLevel || 'your'} activity level, I want to share something crucial about..."

FORBIDDEN: Any response that starts with summarizing their question or uses dialogue tags.

I speak directly to ${firstName} as their wise health mentor. This is real conversation, not roleplay.`;
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

// Helper function to validate and trim response length
function validateResponseLength(answer, mode, maxWords = null) {
  const words = answer.split(' ').length;
  const maxWordsLimit = maxWords || (mode === 'conversational' ? 400 : 200);
  
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

// POST /api/conversationalChat
router.post('/conversationalChat', chatLimiter, auth, async (req, res) => {
  console.log('conversationalChat HIT');
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
      firstName: userProfile.firstName || 'traveler',
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

    // Vector search: top-4 matching passages from knowledge base
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

    // Handle vague user input with personalized guidance
    const vagueInputs = ['help', 'help me', 'what should I do', 'idk', 'unsure', 'no idea'];
    const isVague = vagueInputs.some(v => question.toLowerCase().includes(v));

    let userPrompt;
    if (isVague) {
      const personalizedSuggestions = [];
      if (userData.sleepHours < 7) personalizedSuggestions.push('improving your sleep quality');
      if (userData.activityLevel === 'sedentary') personalizedSuggestions.push('increasing your physical activity');
      if (userData.age >= 40) personalizedSuggestions.push('optimizing your nutrition for healthy aging');
      if (personalizedSuggestions.length === 0) {
        personalizedSuggestions.push('sleep optimization', 'exercise routines', 'nutritional guidance', 'stress management');
      }
      
      userPrompt = `${userData.firstName} seems unsure about where to focus their health efforts. 
      Based on their profile, you notice some specific areas that could benefit them: ${personalizedSuggestions.join(', ')}.
      
      In your warm, conversational style, guide them toward the most relevant area for their situation. 
      Share a brief story or analogy about why this area matters for someone in their position.
      Make it feel like caring advice from a wise friend who truly understands their journey.`;
    } else {
      userPrompt = `${userData.firstName} is asking about: "${question}"

Context from knowledge base:
${context}

RESPOND AS METHUSELAH DIRECTLY TO ${userData.firstName.toUpperCase()}:

- Start immediately with: "${userData.firstName}, with your [specific health data]..."
- Reference their health: age ${userData.age || 'not specified'}, activity: ${userData.activityLevel || 'not specified'}, sleep: ${userData.sleepHours || 'not specified'}h/night
- DO NOT summarize their question
- DO NOT use any role tags or brackets
- Give direct, caring advice with a story or analogy
- End with specific action steps for their situation

Health data you MUST mention: Age ${userData.age || 'not provided'}, BMI ${userData.weight && userData.height ? (userData.weight / ((userData.height/100) ** 2)).toFixed(1) : 'not calculated'}, Activity: ${userData.activityLevel || 'not specified'}, Sleep: ${userData.sleepHours || 'not specified'}h

Respond as if you're sitting with ${userData.firstName} having a real conversation.`;
    }

    const systemPrompt = buildConversationalSystemPrompt(userData);

    // Generate conversational answer with Zephyr-7B
    const chatResp = await hf.chatCompletion({
      model: HF_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 500, // Reduced to force more concise responses
      temperature: 0.1, // Much lower temperature for more predictable output
      top_p: 0.7, // More focused output
      repetition_penalty: 1.3, // Higher penalty to prevent repetitive patterns
      stop: ['USER:', 'ASSISTANT:', 'COACH:', '[COACH]', '[USER]', '[ASSISTANT]', 'USER', 'ASSISTANT', 'COACH'], // Stop generation on script markers
      options: { wait_for_model: true }
    });

    let answer = chatResp.choices?.[0]?.message?.content ?? '';
    
    // NUCLEAR OPTION - Remove EVERYTHING that looks like a script
    answer = answer
      .replace(/^\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|Methuselah:|\[COACH\]|\[Methuselah\])\s*/i, '')
      .replace(/\s*(Assistant:|Coach:|\[ASS\]|\[Assistant\]|Methuselah:|\[COACH\]|\[Methuselah\])\s*$/i, '')
      .trim();
    
    // Remove any form of dialogue or script marker (even more aggressive)
    answer = answer
      .replace(/\[MOHAMMED?\]/gi, `${userData.firstName}`)
      .replace(/\[COACH\]/gi, '')
      .replace(/\[ASSISTANT\]/gi, '')
      .replace(/\[USER\]/gi, '')
      .replace(/\(COACH\)/gi, '')
      .replace(/\(ASSISTANT\)/gi, '')
      .replace(/\(USER\)/gi, '')
      .replace(/^\s*\[.*?\]\s*/gm, '') // Remove any bracketed content at start of lines
      .replace(/\b(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI):\s*/gi, '')
      .replace(/\[(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI)\]/gi, '')
      .replace(/\*\*(USER|ASSISTANT|COACH|CLIENT|PERSON|METHUSELAH|BOT|AI)\*\*:?/gi, '')
      .replace(/^\s*-\s*(User|Assistant|Coach|Client|Person|Methuselah|Bot|AI):/gim, '');
    
    // Remove summary phrases and script-like language
    answer = answer
      .replace(/^\s*(absolutely,?\s*)?mohammed?\s*[,!]?\s*/i, `${userData.firstName}, `)
      .replace(/hi there[,!]?\s*/gi, `${userData.firstName}, `)
      .replace(/getting enough.*?sleep is crucial/gi, 'your sleep situation is crucial')
      .replace(/here's what i might say/gi, '')
      .replace(/for example, i could tell you/gi, '')
      .replace(/here's a sample conversation/gi, '')
      .replace(/you might ask me/gi, '')
      .replace(/if you were to ask/gi, '')
      .replace(/let me address your question/gi, 'let me help you with this')
      .replace(/regarding your question about/gi, 'about')
      .replace(/you asked about/gi, 'regarding')
      .replace(/your question about/gi, 'your concerns about');
    
    // Remove questions and question-like content
    const sentences = answer.split(/[.!?]+/);
    const filteredSentences = sentences.filter(sentence => {
      const trimmed = sentence.trim();
      if (!trimmed) return false;
      
      // Skip empty or very short responses
      if (trimmed.length < 10) return false;
      
      // Remove sentences with question marks
      if (trimmed.includes('?')) return false;
      
      // Remove question-like sentences
      const lowerTrimmed = trimmed.toLowerCase();
      const questionPhrases = [
        'would you', 'do you', 'can you', 'are you', 'will you', 'have you',
        'what do', 'how do', 'when do', 'where do', 'why do',
        'what are', 'how are', 'when are', 'where are', 'why are',
        'what would', 'how would', 'when would', 'where would', 'why would',
        'are you ready', 'ready to', 'interested in learning',
        'want to know', 'curious about', 'wondering if', 'would like to'
      ];
      
      return !questionPhrases.some(phrase => lowerTrimmed.includes(phrase));
    });
    
    answer = filteredSentences.join('. ').trim();
    
    // Ensure it starts with the user's name if it doesn't already
    if (answer && !answer.toLowerCase().startsWith(userData.firstName.toLowerCase())) {
      answer = `${userData.firstName}, ${answer.replace(/^[A-Z]/, char => char.toLowerCase())}`;
    }
    
    // Final cleanup
    answer = answer
      .replace(/\s{2,}/g, ' ') // Remove multiple spaces
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    // Ensure proper ending
    if (answer && !answer.match(/[.!]$/)) {
      answer += '.';
    }
    
    // Ensure we have a valid response
    if (!answer) {
      answer = `I apologize, ${userData.firstName}, but I encountered an issue generating a response. Could you please rephrase your question?`;
    }

    // Validate and trim response length if necessary
    answer = validateResponseLength(answer, 'conversational');

    res.json({ 
      answer, 
      contextDocs: docs,
      mode: 'conversational',
      personalizedFor: userData.firstName 
    });
    
  } catch (err) {
    console.error('conversationalChat ERROR', err);
    res.status(500).json({ error: err.message || 'conversationalChat failed' });
  }
});

export default router;
