"use client";
import 'regenerator-runtime/runtime';
import ChatInterface from '../components/ChatInterface';
import WebcamComponent from '../components/Webcam';
import { useState } from 'react';

export default function HomePage() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-8">
        {/* Chat Card */}
        <div className="flex-1 min-w-[320px] max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[600px] justify-between">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white/80 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
            </div>
            <button
              className="px-3 py-1 md:px-4 md:py-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors text-sm md:text-base font-medium min-w-[100px]"
              onClick={() => setShowVideo((v) => !v)}
            >
              {showVideo ? 'Hide Video' : 'Show Video'}
            </button>
          </div>
          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-2 md:p-4">
            <ChatInterface />
          </div>
        </div>

        {/* Video Card */}
        {showVideo && (
          <div className="flex-1 min-w-[320px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center p-4 h-[400px]">
            <div className="mb-2 text-blue-600 font-semibold text-lg">Live Video</div>
            <div className="w-full flex justify-center">
              <WebcamComponent />
            </div>
            <button
              className="mt-4 px-4 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm w-full max-w-[180px]"
              onClick={() => setShowVideo(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
