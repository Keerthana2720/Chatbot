'use client';

import React from 'react';

interface AvatarProps {
  isTalking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ isTalking = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const eyeSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const mouthSizeClasses = {
    sm: 'w-3 h-2',
    md: 'w-4 h-3',
    lg: 'w-6 h-4',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Avatar Container */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative overflow-hidden ${
          isTalking ? 'animate-pulse' : 'animate-float'
        }`}
      >
        {/* Face */}
        <div className="relative">
          {/* Eyes */}
          <div className="flex justify-center space-x-2 mb-1">
            <div
              className={`${eyeSizeClasses[size]} bg-white rounded-full relative animate-blink`}
            >
              <div
                className={`${eyeSizeClasses[size]} bg-gray-800 rounded-full absolute top-0 left-0`}
                style={{ transform: 'scale(0.5)' }}
              />
            </div>
            <div
              className={`${eyeSizeClasses[size]} bg-white rounded-full relative animate-blink`}
            >
              <div
                className={`${eyeSizeClasses[size]} bg-gray-800 rounded-full absolute top-0 left-0`}
                style={{ transform: 'scale(0.5)' }}
              />
            </div>
          </div>
          
          {/* Mouth */}
          <div
            className={`${mouthSizeClasses[size]} border-2 border-white border-t-0 rounded-b-full mx-auto ${
              isTalking ? 'animate-talk' : ''
            }`}
            style={{
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          />
        </div>
      </div>
      
      {/* Status Indicator */}
      {isTalking && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
      )}
      
      {/* Floating Animation */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 animate-pulse" />
    </div>
  );
};

export default Avatar;
