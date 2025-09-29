'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudio } from '@/contexts/AudioContext';
import ChatInterface from '@/components/ChatInterface';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { user, loading } = useAuth();
  const { isListening, isSpeaking } = useAudio();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              AI Chatbot
            </h1>
            <p className="text-gray-600">
              Advanced AI assistant with audio and video features
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {showRegister ? (
              <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
            ) : (
              <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
            )}
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      </div>
      
      {/* Status indicators */}
      {isListening && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          🎤 Listening...
        </div>
      )}
      
      {isSpeaking && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          🔊 Speaking...
        </div>
      )}
      
      <Toaster />
    </div>
  );
}
