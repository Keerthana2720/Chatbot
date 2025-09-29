'use client';

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported on this device');
      return;
    }

    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setIsStreaming(true);
        setError(null);
      })
      .catch((err) => {
        console.error('Camera access denied:', err);
        setError('Camera access denied. Please allow camera permission.');
      });
  }, []);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: 'user',
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">📹</div>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={320}
          height={240}
          videoConstraints={videoConstraints}
          className="w-full h-auto"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {isStreaming ? '● Live' : '● Connecting...'}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mt-2 flex justify-center space-x-2">
        <button
          onClick={() => {
            if (webcamRef.current) {
              const imageSrc = webcamRef.current.getScreenshot();
              if (imageSrc) {
                // Handle screenshot
                console.log('Screenshot taken:', imageSrc);
              }
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        >
          📸 Capture
        </button>
      </div>
    </div>
  );
};

export default WebcamComponent;
