
"use client";
import 'regenerator-runtime/runtime';
import { useAudio } from '@/contexts/AudioContext';
import { useEffect } from 'react';

export default function HomePage() {
  const {
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
  } = useAudio();

  useEffect(() => {
    speak("Hello, welcome to the AI chatbot!");
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🎙️ AI Chatbot</h1>
      <p>Status: {isListening ? 'Listening...' : 'Not Listening'}</p>
      <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={startListening} style={buttonStyle}>Start Listening</button>
        <button onClick={stopListening} style={buttonStyle}>Stop Listening</button>
        <button onClick={() => speak("This is a test speech.")} style={buttonStyle}>Speak</button>
      </div>
    </main>
  );
}

const buttonStyle = {
  marginRight: '1rem',
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  backgroundColor: '#4ade80',
  color: '#000',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
