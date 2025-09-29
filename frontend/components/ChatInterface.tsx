'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import { chatAPI } from '@/lib/api';
import { Send, Mic, MicOff, Camera, Settings, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import MessageBubble from './MessageBubble';
import Avatar from './Avatar';
import Webcam from './Webcam';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const { 
    isListening, 
    isSpeaking, 
    startListening, 
    stopListening, 
    speak, 
    autoSpeak, 
    setAutoSpeak 
  } = useAudio();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const response = await chatAPI.getHistory(user.id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(content, user.id, conversationId);
      const { aiMessage } = response.data;
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }

      // Auto-speak AI response
      if (autoSpeak && aiMessage.content) {
        speak(aiMessage.content);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam(!showWebcam);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar isTalking={isSpeaking} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to help'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoSpeak}
            className={`p-2 rounded-lg transition-colors ${
              autoSpeak 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
          >
            {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={toggleWebcam}
            className={`p-2 rounded-lg transition-colors ${
              showWebcam 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle camera"
          >
            <Camera size={20} />
          </button>
          
          <button
            onClick={toggleSettings}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">👋 Hello! I'm your AI assistant.</p>
            <p>You can type a message, use voice input, or enable the camera to start chatting!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="spinner"></div>
            <span>AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Webcam */}
      {showWebcam && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <Webcam />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-3 rounded-full transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
