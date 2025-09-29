const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

// Speech-to-Text using OpenAI Whisper
router.post('/transcribe', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const audioBuffer = fs.readFileSync(audioPath);

    // Transcribe using OpenAI Whisper
    const transcription = await transcribeAudio(audioBuffer);

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    res.json({ 
      transcription,
      language: 'en' // Default to English, could be detected
    });

  } catch (error) {
    logger.error('Error transcribing audio:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Text-to-Speech using ElevenLabs
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get user's preferred voice or use default
    const voice = voiceId || process.env.ELEVENLABS_DEFAULT_VOICE || '21m00Tcm4TlvDq8ikWAM';

    // Synthesize speech using ElevenLabs
    const audioBuffer = await synthesizeSpeech(text, voice);

    // Save audio to database if userId provided
    if (userId) {
      await prisma.audioFile.create({
        data: {
          userId,
          text,
          voiceId: voice,
          filePath: null, // Store in memory for now
          duration: 0 // Could be calculated
        }
      });
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'no-cache'
    });

    res.send(audioBuffer);

  } catch (error) {
    logger.error('Error synthesizing speech:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const voices = await getElevenLabsVoices();
    res.json({ voices });
  } catch (error) {
    logger.error('Error fetching voices:', error);
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// Get user's audio history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const audioFiles = await prisma.audioFile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ audioFiles });
  } catch (error) {
    logger.error('Error fetching audio history:', error);
    res.status(500).json({ error: 'Failed to fetch audio history' });
  }
});

// Helper function to transcribe audio using OpenAI Whisper
async function transcribeAudio(audioBuffer) {
  try {
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.mp3',
      contentType: 'audio/mpeg'
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );

    return response.data.text;
  } catch (error) {
    logger.error('OpenAI Whisper API error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

// Helper function to synthesize speech using ElevenLabs
async function synthesizeSpeech(text, voiceId) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    logger.error('ElevenLabs API error:', error);
    throw new Error('Failed to synthesize speech');
  }
}

// Helper function to get available voices from ElevenLabs
async function getElevenLabsVoices() {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });

    return response.data.voices.map(voice => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      preview_url: voice.preview_url
    }));
  } catch (error) {
    logger.error('Error fetching ElevenLabs voices:', error);
    return [];
  }
}

module.exports = router;
