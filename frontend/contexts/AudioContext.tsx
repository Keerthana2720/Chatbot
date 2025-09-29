'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
}

interface AudioContextType {
  isListening: boolean;
  isSpeaking: boolean;
  voices: Voice[];
  selectedVoice: string;
  autoSpeak: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  transcribeAudio: (audioBlob: Blob) => Promise<string>;
  synthesizeSpeech: (text: string, voiceId?: string) => Promise<Blob>;
  setSelectedVoice: (voiceId: string) => void;
  setAutoSpeak: (enabled: boolean) => void;
  loadVoices: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  const {
    transcript,
    listening: isListening,
    resetTranscript,
  } = useSpeechRecognition();

  // ✅ Define these functions using SpeechRecognition directly
  const startListening = () => {
    try {
      SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Speech recognition not supported');
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
      loadVoices();
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      console.log('Transcribed:', transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const loadVoices = async () => {
    try {
      const response = await api.get('/audio/voices');
      setVoices(response.data.voices);

      if (response.data.voices.length > 0 && !selectedVoice) {
        setSelectedVoice(response.data.voices[0].voice_id);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
      toast.error('Failed to load voices');
    }
  };

  const speak = (text: string) => {
    if (!speechSynthesis) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      const voice = speechSynthesis
        .getVoices()
        .find((v) => v.name.includes(selectedVoice));
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const response = await api.post('/audio/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.transcription;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error('Failed to transcribe audio');
    }
  };

  const synthesizeSpeech = async (text: string, voiceId?: string): Promise<Blob> => {
    try {
      const response = await api.post(
        '/audio/synthesize',
        {
          text,
          voiceId: voiceId || selectedVoice,
        },
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      throw new Error('Failed to synthesize speech');
    }
  };

  const value: AudioContextType = {
    isListening,
    isSpeaking,
    voices,
    selectedVoice,
    autoSpeak,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcribeAudio,
    synthesizeSpeech,
    setSelectedVoice,
    setAutoSpeak,
    loadVoices,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
