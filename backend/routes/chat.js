const express = require('express');
const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get chat history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { message, userId, conversationId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        userId,
        conversationId: conversationId || null
      }
    });

    // Get conversation context
    const recentMessages = await prisma.message.findMany({
      where: { 
        conversationId: conversationId || userMessage.conversationId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Prepare messages for OpenAI
    const messages = recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system message
    messages.unshift({
      role: 'system',
      content: 'You are a helpful AI assistant. Be concise, friendly, and helpful. Keep responses under 200 words.'
    });

    // Get AI response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'assistant',
        userId,
        conversationId: userMessage.conversationId
      }
    });

    res.json({
      userMessage,
      aiMessage,
      conversationId: userMessage.conversationId
    });

  } catch (error) {
    logger.error('Error processing chat message:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ error: 'OpenAI API quota exceeded' });
    }
    
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Create new conversation
router.post('/conversation', async (req, res) => {
  try {
    const { userId, title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId
      }
    });

    res.json(conversation);
  } catch (error) {
    logger.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get user conversations
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    res.json({ conversations });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Delete conversation
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Verify ownership
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete conversation and all messages
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;
