// src/components/ChatGPT/useChatGPT.ts
// Violet Yousif, 6/16/2025, Checks if the user is logged in before allowing chat functionality.
// Violet Yousif, 6/16/2025, Removed Web3-specific code for a more general implementation.
// Mizanur Mizan, 6/25/2025, Connected backend llm question response to chatbot frontend
// Syed Rabbey, 6/27/2025, Integrated user's first name into chat greeting and question prompts.
// Mohammad Hoque, 7/3/2025, Connected frontend conversation management to backend MongoDB storage.
// Violet Yousif, 7/7/2025, Fixed personalized health context to user questions based on health data.

import { useEffect, useReducer, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import ClipboardJS from 'clipboard'
import { throttle } from 'lodash-es'
import { ChatGPTProps, ChatMessage, ChatRole } from './interface'
// You cannot directly "call" User.js from the frontend. Instead, you must create secure backend API endpoints that use your User.js model to fetch or update user data.
// Example (backend, e.g. Express):
// In your backend (Node.js/Express), import User.js and define an endpoint:

// Never import or use User.js directly in frontend code.
import {
  getConversation,
  addMessage,
  clearConversation,
  generateSummary,
  Conversation,
  UserData
} from '../../models'
import app from 'next/app'

const scrollDown = throttle(
  () => {
    // Find the message list container and scroll it to bottom
    const messageList = document.querySelector('.message-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  },
  300,
  { leading: true, trailing: false }
)


const requestMessage = async (
  url: string,
  query: string,
  controller: AbortController | null
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ query }),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    signal: controller?.signal
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage += ` - ${errorData.error}`;
      }
    } catch {
      // If response body is not JSON, use the original error message
    }
    throw new Error(errorMessage);
  }

  return response.json(); // Expects { answer, contextDocs }
};

// const requestMessage = async (
//   url: string,
//   query: string,
//   //chatMode: 'direct' | 'conversational',
//   // messages: ChatMessage[],
//   controller: AbortController | null
// ) => {
//   const response = await fetch(url, {
//     method: 'POST',
//     body: JSON.stringify({ query }),
//     credentials: 'include',     // Include cookies for session management request
//     headers: { 'Content-Type': 'application/json' },
//     signal: controller?.signal
//   });

//   if (!response.ok) {
//     throw new Error(response.statusText);
//   }
//   /* const data = response.body
//   if (!data) {
//     throw new Error('No data')
//   }
//   return data.getReader() */
//   return response.json(); // ragChat returns JSON { answer, contextDocs }
//};


// Get the average sleep hours over the past 7 days
function calculateAvgSleepHours(dates: Record<string, any>): number | null {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6); // Include today

  let totalSleep = 0;
  let count = 0;

  for (const [dateStr, data] of Object.entries(dates)) {
    const date = new Date(dateStr);

    if (date >= sevenDaysAgo && date <= now && typeof data.sleepHours === 'number') {
      totalSleep += data.sleepHours;
      count++;
    }
  }

  return count > 0 ? totalSleep / count : null;
}



function buildPersonalizedContext(healthData: UserData | null, metricDates: Record<string, any>): string {
  if (!healthData) return '';
  const { dateOfBirth, weight, height, gender, activityLevel } = healthData;
  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();

  let context = `This user is a ${age}-year-old ${gender}, weighing ${weight} kg and standing ${height} cm tall. `;
  if (activityLevel) context += `They have a(n) ${activityLevel} activity level. `;

  const avgSleep = calculateAvgSleepHours(metricDates);
  if (avgSleep !== null) {
    context += `They sleep about ${avgSleep.toFixed(1)} hours on average. `;
  }

  return context.trim();
}



export const useChatGPT = (
  props: ChatGPTProps & { 
    conversationId: string; 
    isLoggedIn?: boolean 
  }) => {
  const { conversationId, isLoggedIn = false } = props;
  const router = useRouter();
  // const { fetchPath, conversationId, walletAddress } = props  // Original Web3 version
  const fetchPath = 'http://localhost:8080/api/ragChat'
  const [, forceUpdate] = useReducer((x) => !x, false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [healthData, setHealthData] = useState<UserData | null>(null)
  const [metricDates, setMetricDates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false)
  const [disabled] = useState<boolean>(false)
  const [streamedMessage, setStreamedMessage] = useState<string>('');
  const [isFallback, setIsFallback] = useState<boolean>(false); 
  
  const greetingAttempted = useRef<Set<string>>(new Set());
  const controller = useRef<AbortController | null>(null)
  const currentMessage = useRef<string>('')

  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch if user is logged in
      if (!isLoggedIn) return;
      
      // Session-based health data fetching (updated for non-Web3)
      try {
        const response = await fetch(`http://localhost:8080/api/user-data`, {
          credentials: 'include'
        })
        const data = await response.json()
        setHealthData(data || null)
      } catch (error) {
        console.error('Error fetching health data:', error)
      }
    }
    fetchUserData()
  }, [isLoggedIn])


  useEffect(() => {
    const fetchMetrics = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await fetch('http://localhost:8080/api/health-metrics', { credentials: 'include' });
        const data = await res.json();
        setMetricDates(data.dates || {});
      } catch (err) {
        console.error('Failed to load health metrics:', err);
      }
    };

    fetchMetrics();
  }, [isLoggedIn]);


useEffect(() => {
    const loadConversationAndInitGreeting = async () => {
      const conv = await getConversation(conversationId);
      setCurrentConversation(conv || null);

      if (healthData && (!conv?.messages || conv.messages.length === 0)) {
        if (!greetingAttempted.current.has(conversationId)) {
          greetingAttempted.current.add(conversationId);
          try {
            const userName = healthData.firstName || 'traveler';
            await addMessage(
              conversationId,
              ChatRole.Assistant,
              `Greetings, ${userName}. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.`
            );
            const updatedConv = await getConversation(conversationId);
            setCurrentConversation(updatedConv || null);
            forceUpdate();
          } catch (err) {
            console.error('Greeting error:', err);
            greetingAttempted.current.delete(conversationId);
          }
        }
      }
    };
    
    loadConversationAndInitGreeting();
  }, [conversationId, healthData]);


  const fetchMessage = async (query: string) => {
    try {
      controller.current = new AbortController();
      setLoading(true);
      setIsFallback(false);

      console.log('Sending to RAG Chat:', query);

      const data = await requestMessage(fetchPath, query, controller.current);
      console.log('RAG Response received:', data);

      const assistantReply = data.answer;
      console.log('Assistant reply:', assistantReply);
      
      const isFallbackResponse = !data.contextDocs || data.contextDocs.length === 0;
      setIsFallback(isFallbackResponse);

      if (!assistantReply || assistantReply.trim() === '') {
        setStreamedMessage('I apologize, but I\'m having trouble generating a response right now. Please try asking your question again.');
        setLoading(false);
        return;
      }

      // Show the response with streaming effect
      let currentText = '';
      const words = assistantReply.split(' ');
      for (let i = 0; i < words.length; i++) {
        currentText += words[i] + ' ';
        setStreamedMessage(currentText);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Clear the streaming message and add to conversation
      setStreamedMessage('');
      await addMessage(conversationId, ChatRole.Assistant, assistantReply);
      const updatedConv = await getConversation(conversationId);
      setCurrentConversation(updatedConv || null);
      setLoading(false);
      scrollDown();
    } catch (e) {
      console.error('Chat request failed:', e);
      
      // Handle specific error types
      if (e instanceof Error) {
        if (e.message.includes('401')) {
          setStreamedMessage('Authentication required. Redirecting to login...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (e.message.includes('403')) {
          setStreamedMessage('Access denied. Please check your permissions.');
        } else if (e.message.includes('400')) {
          setStreamedMessage('Invalid request. Please try again.');
        } else if (e.message.includes('500')) {
          setStreamedMessage('Server error. Please try again later.');
        } else {
          setStreamedMessage('Something went wrong. Please try again.');
        }
      } else {
        setStreamedMessage('Something went wrong. Please try again.');
      }
      
      setLoading(false);
    }
  };
  
  const onSend = (message: ChatMessage) => {
    addMessage(conversationId, message.role, message.content).then(async () => {
      const updatedConv = await getConversation(conversationId);
      setCurrentConversation(updatedConv || null);
    }).catch(error => {
      console.error('Error saving message:', error);
    });

    const personalContext = buildPersonalizedContext(healthData, metricDates);
    const fullQuery = personalContext
      ? `${personalContext}\n\nUser's question: ${message.content}`
      : message.content;

    fetchMessage(fullQuery);
  };

  const onClear = async () => {
    clearConversation(conversationId);
    const updatedConv = await getConversation(conversationId);
    setCurrentConversation(updatedConv || null);
  };

  const onStop = async () => {
    if (controller.current) {
      controller.current.abort();
      setLoading(false);
    }
  };

  useEffect(() => {
    new ClipboardJS('.chat-wrapper .copy-btn');
  }, []);

  return {
    loading,
    disabled,
    messages: currentConversation?.messages || [],
    currentMessage,
    streamedMessage,
    isFallback,
    onSend,
    onClear,
    onStop
  };
};

  //   }
  //   loadConversationAndInitGreeting()

  // }, [conversationId, isLoggedIn])

  //// Prev code (DON'T DELETE):
  // }, [conversationId, walletAddress])

  // useEffect(() => {
  //   const initializeGreeting = async () => {
  //     if (!healthData || greetingSent) return;

  //     const conv = await getConversation(conversationId);
  //     const hasNoMessages = conv?.messages.length === 0;

  //     if (hasNoMessages) {
  //       const userName = healthData.firstName || 'traveler';
  //       await addMessage(
  //         conversationId,
  //         ChatRole.Assistant,
  //         `Greetings, ${userName}. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.`
  //       );
  //       const updatedConv = await getConversation(conversationId)
  //       setCurrentConversation(updatedConv || null);
  //       setGreetingSent(true);
  //     }
  //   }
    
  //   initializeGreeting()
  // }, [healthData, greetingSent, conversationId]);




  //// Prev code (DON'T DELETE):
  // Original Web3 version:
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (walletAddress) {
  //       const response = await fetch(`/api/user-data?walletAddress=${walletAddress}`)
  //       const data = await response.json()
  //       setHealthData(data || null)
  //     }
  //   }
  //   fetchUserData()
  //   
  //   const conv = getConversation(conversationId)
  //   setCurrentConversation(conv || null)
  //   if (conv && conv.messages.length === 0) {
  //     addMessage(
  //       conversationId,
  //       ChatRole.Assistant,
  //       'Greetings, traveler. I am Methuselah, a wise old man who has lived for centuries. Ask me what you seek, and I shall share my wisdom.'
  //     )
  //     setCurrentConversation(getConversation(conversationId) || null)
  //   }
  // }, [conversationId, walletAddress])

//   const archiveCurrentMessage = async () => {
//     const content = currentMessage.current
//     currentMessage.current = ''
//     setLoading(false)
//     if (content) {
//       await addMessage(conversationId, ChatRole.Assistant, content)
//       const updatedConv = await getConversation(conversationId)
//       setCurrentConversation(updatedConv || null)
//       await generateSummary(conversationId, fetchPath)
//       const finalConv = await getConversation(conversationId)
//       setCurrentConversation(finalConv || null)
//       scrollDown()
//     }
//   }


// function buildPersonalizedContext(healthData: UserData | null): string {
//   if (!healthData) return '';

//   const {
//     dateOfBirth,
//     weight,
//     height,
//     gender,
//     activityLevel,
//   } = healthData;

//   let age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
//   let context = `This user is a ${age}-year-old ${gender}, weighing ${weight} kg and standing ${height} cm tall. `;
//   if (activityLevel) context += `They have a(n) ${activityLevel} activity level. `;

//   const avgSleep = calculateAvgSleepHours(dates || {});
//   if (avgSleep !== null) context += `They sleep about ${avgSleep.toFixed(1)} hours on average. `;

//   return context.trim();
// }
//       /* const reader = await requestMessage(fetchPath, messages, controller.current)
//       const decoder = new TextDecoder('utf-8')
//       let done = false

//       while (!done) {
//         const { value, done: readerDone } = await reader.read()
//         if (value) {
//           const char = decoder.decode(value)
//           if (char === '\n' && currentMessage.current.endsWith('\n')) {
//             continue
//           }
//           if (char) {
//             currentMessage.current += char
//             forceUpdate()
//           }
//           scrollDown()
//         }
//         done = readerDone
//       }

//       await archiveCurrentMessage()
//     } catch (e) {
//       console.error(e)
//       setLoading(false)
//     } */
//   }

//   const onSend = (message: ChatMessage) => {
//     // Add message asynchronously but don't block the UI
//     addMessage(conversationId, message.role, message.content).then(async () => {
//       const updatedConv = await getConversation(conversationId)
//       setCurrentConversation(updatedConv || null);
//     }).catch(error => {
//       console.error('Error saving message:', error);
//     });

//     // const healthPrompt = healthData
//     //   ? `User: ${healthData.age} years, ${healthData.weight}kg, ${healthData.height}cm, ${healthData.activityLevel}, ${healthData.sleepHours}h sleep—`
//     //   : '' ;

//     // const fullQuery = `${healthPrompt}${message.content}`;
//     // fetchMessage(fullQuery);

//     const personalContext = buildPersonalizedContext(healthData);
//     const fullQuery = personalContext
//       ? `${personalContext}\n\nUser's question: ${message.content}`
//       : message.content;

//     fetchMessage(fullQuery);


//     /* const fullMessage = { ...message, content: `${healthPrompt}${message.content}` }
//     fetchMessage([
//       ...((currentConversation?.messages || []).map(msg => ({
//         ...msg,
//         timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString()
//       }))),
//       fullMessage
//     ]) */
//   }

//   const onClear = async () => {
//     clearConversation(conversationId)
//     const updatedConv = await getConversation(conversationId)
//     setCurrentConversation(updatedConv || null)
//   }

//   const onStop = async () => {
//     if (controller.current) {
//       controller.current.abort()
//       await archiveCurrentMessage()
//     }
//   }

//   useEffect(() => {
//     new ClipboardJS('.chat-wrapper .copy-btn')
//   }, [])

//   return {
//     loading,
//     disabled,
//     messages: currentConversation?.messages || [],
//     currentMessage,
//     streamedMessage,
//     isFallback,
//     onSend,
//     onClear,
//     onStop
// };
// };

