// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Chatbot with Audio & Video',
  description:
    'Advanced AI chatbot with speech-to-text, text-to-speech, and video features',

  openGraph: {
    title: 'AI Chatbot with Audio & Video',
    description:
      'Experience an advanced AI chatbot with speech-to-text, text-to-speech, and video integration.',
    url: 'https://your-domain.com',
    siteName: 'AI Chatbot',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Chatbot Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbot with Audio & Video',
    description:
      'Experience an advanced AI chatbot with speech-to-text, text-to-speech, and video integration.',
    images: ['/og-image.png'],
  },

  // ✅ Custom meta tag (not part of Metadata type)
  other: {
    keywords: 'AI, chatbot, speech, audio, video, OpenAI, ElevenLabs',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
