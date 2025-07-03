// Mohammad Hoque, 7/3/2025, Created conversation management routes on conversation collection

import express from 'express';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const router = express.Router();

// Rate limiting for conversation operations
const conversationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many conversation requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /conversations - Get all conversations for the authenticated user
router.get('/conversations', conversationLimiter, auth, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversations = await Conversation.find({ userId: user._id })
      .select('_id title createdAt updatedAt messages')
      .sort({ updatedAt: -1 });

    // Transform the data to match frontend expectations
    const formattedConversations = conversations.map(conv => ({
      conversationId: conv._id.toString(),
      title: conv.title,
      summary: conv.summary?.content || '',
      walletAddress: user.email || 'default-user', // Use email as identifier
      messages: conv.messages.map(msg => ({
        messageId: msg._id.toString(),
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp
      })),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// POST /conversations - Create a new conversation
router.post('/conversations', conversationLimiter, auth, async (req, res) => {
  try {
    const { title = 'New Chat' } = req.body;
    
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newConversation = new Conversation({
      userId: user._id,
      title,
      messages: []
    });

    const savedConversation = await newConversation.save();

    // Format response to match frontend expectations
    const formattedConversation = {
      conversationId: savedConversation._id.toString(),
      title: savedConversation.title,
      summary: '',
      walletAddress: user.email || 'default-user',
      messages: [],
      createdAt: savedConversation.createdAt,
      updatedAt: savedConversation.updatedAt
    };

    res.status(201).json(formattedConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

// PUT /conversations/:id/title - Update conversation title
router.put('/conversations/:id/title', conversationLimiter, auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversation = await Conversation.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.title = title.trim();
    await conversation.save();

    res.json({ 
      message: 'Title updated successfully',
      conversationId: conversation._id.toString(),
      title: conversation.title
    });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    res.status(500).json({ message: 'Failed to update conversation title' });
  }
});

// DELETE /conversations/:id - Delete a conversation
router.delete('/conversations/:id', conversationLimiter, auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversation = await Conversation.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Conversation.deleteOne({ _id: id, userId: user._id });

    res.json({ 
      message: 'Conversation deleted successfully',
      conversationId: id
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Failed to delete conversation' });
  }
});

// POST /conversations/:id/messages - Add a message to conversation
router.post('/conversations/:id/messages', conversationLimiter, auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: 'Sender and text are required' });
    }

    if (!['user', 'AI'].includes(sender)) {
      return res.status(400).json({ message: 'Invalid sender type' });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversation = await Conversation.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const newMessage = {
      sender,
      text,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);
    await conversation.save();

    const addedMessage = conversation.messages[conversation.messages.length - 1];

    // Format response to match frontend expectations
    const formattedMessage = {
      messageId: addedMessage._id.toString(),
      role: sender === 'user' ? 'user' : 'assistant',
      content: addedMessage.text,
      timestamp: addedMessage.timestamp
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
});

// GET /conversations/:id - Get a specific conversation
router.get('/conversations/:id', conversationLimiter, auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const conversation = await Conversation.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Format response to match frontend expectations
    const formattedConversation = {
      conversationId: conversation._id.toString(),
      title: conversation.title,
      summary: conversation.summary?.content || '',
      walletAddress: user.email || 'default-user',
      messages: conversation.messages.map(msg => ({
        messageId: msg._id.toString(),
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
});

export default router;
