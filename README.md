# AI Chatbot with Audio & Video Features

A comprehensive full-stack AI chatbot application with Express.js backend, Next.js frontend, and PostgreSQL database. Features advanced speech-to-text, text-to-speech, video integration, and OpenAI GPT integration.

## 🏗️ Architecture

```
ai-chatbot/
├── backend/           # Express.js server with OpenAI, Whisper, ElevenLabs
├── frontend/          # Next.js React app with chat UI + microphone recorder
├── db/               # PostgreSQL schema
└── README.md         # Setup and run instructions
```

## ✨ Features

### 🎤 Advanced Audio Features
- **Speech-to-Text**: OpenAI Whisper integration for accurate transcription
- **Text-to-Speech**: ElevenLabs API for natural voice synthesis
- **Voice Selection**: Multiple voice options with previews
- **Audio History**: Store and manage audio interactions

### 📹 Video & Visual Features
- **Webcam Integration**: Real-time camera feed with capture functionality
- **Animated Avatar**: Interactive robot avatar with talking animations
- **Responsive UI**: Modern, mobile-friendly interface

### 🤖 AI & Chat Features
- **OpenAI GPT Integration**: Advanced conversational AI
- **Conversation Management**: Create, manage, and delete chat sessions
- **Message History**: Persistent chat storage
- **Context Awareness**: Maintains conversation context

### 🔐 User Management
- **Authentication**: JWT-based user authentication
- **User Profiles**: Account management and preferences
- **Secure Storage**: Encrypted password storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (optional)
- ElevenLabs API key (optional)

### 1. Clone and Install
```bash
git clone <repository-url>
cd ai-chatbot
npm run install:all
```

### 2. Database Setup
```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/ai_chatbot"

# Generate Prisma client and push schema
npm run db:generate
npm run db:push
```

### 3. Configure Environment Variables

**Backend (.env)**:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chatbot"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
PORT=5000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run the Application
```bash
# Development mode (both backend and frontend)
npm run dev

# Or run separately:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database Studio: `npm run db:studio`

## 📁 Project Structure

### Backend (`/backend`)
```
backend/
├── routes/
│   ├── auth.js          # User authentication routes
│   ├── chat.js          # Chat and conversation management
│   └── audio.js         # Speech-to-text and text-to-speech
├── config/
│   └── database.js      # Database connection and Prisma setup
├── utils/
│   └── logger.js        # Winston logging configuration
├── server.js            # Express server setup
└── package.json         # Backend dependencies
```

### Frontend (`/frontend`)
```
frontend/
├── app/
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Main chat interface
│   └── globals.css      # Global styles and Tailwind
├── components/
│   ├── ChatInterface.tsx    # Main chat component
│   ├── MessageBubble.tsx    # Individual message display
│   ├── Avatar.tsx           # Animated avatar component
│   ├── Webcam.tsx           # Camera integration
│   ├── LoginForm.tsx        # User authentication
│   ├── RegisterForm.tsx     # User registration
│   ├── Header.tsx           # App header
│   └── Sidebar.tsx          # Conversation sidebar
├── contexts/
│   ├── AuthContext.tsx      # Authentication state management
│   └── AudioContext.tsx     # Audio features state
├── lib/
│   └── api.ts               # API client configuration
└── package.json             # Frontend dependencies
```

### Database (`/db`)
```
db/
└── schema.prisma        # PostgreSQL schema with Prisma
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Chat
- `GET /api/chat/history/:userId` - Get chat history
- `POST /api/chat/message` - Send message and get AI response
- `POST /api/chat/conversation` - Create new conversation
- `GET /api/chat/conversations/:userId` - Get user conversations
- `DELETE /api/chat/conversation/:conversationId` - Delete conversation

### Audio
- `POST /api/audio/transcribe` - Speech-to-text using Whisper
- `POST /api/audio/synthesize` - Text-to-speech using ElevenLabs
- `GET /api/audio/voices` - Get available voices
- `GET /api/audio/history/:userId` - Get audio history

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run dev                 # Run both backend and frontend
npm run dev:backend        # Run backend only
npm run dev:frontend       # Run frontend only

# Production
npm run build              # Build both applications
npm run start              # Start production servers

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:migrate        # Run database migrations
npm run db:studio         # Open Prisma Studio

# Setup
npm run setup             # Complete setup (install + db)
```

### Database Management
```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open database management UI
npm run db:studio
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for frontend-backend communication
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

## 🎨 Customization

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable React components
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode**: Built-in dark mode support

### AI Integration
- **OpenAI GPT**: Configurable AI model and parameters
- **ElevenLabs Voices**: Multiple voice options
- **Fallback Responses**: Smart responses when APIs are unavailable

## 🚨 Troubleshooting

### Common Issues

**Database Connection**:
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify connection string in .env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chatbot"
```

**API Keys**:
- Ensure OpenAI API key is valid and has credits
- Verify ElevenLabs API key is active
- Check API key permissions and quotas

**Audio Features**:
- Ensure HTTPS or localhost for microphone access
- Check browser permissions for microphone/camera
- Verify audio drivers are working

**Build Issues**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install:all
```

### Logs
- Backend logs: `backend/logs/`
- Frontend logs: Browser console
- Database logs: PostgreSQL logs

## 📊 Performance

### Optimization Features
- **Database Indexing**: Optimized database queries
- **Caching**: Response caching for better performance
- **Code Splitting**: Frontend code splitting for faster loading
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analysis

### Monitoring
- **Winston Logging**: Comprehensive application logging
- **Error Tracking**: Detailed error logging and tracking
- **Performance Metrics**: API response time monitoring

## 🔮 Future Enhancements

- **Real-time Chat**: WebSocket integration for real-time messaging
- **File Uploads**: Support for image and document uploads
- **Multi-language**: Internationalization support
- **Mobile App**: React Native mobile application
- **Analytics**: User interaction analytics
- **Admin Panel**: Administrative interface
- **API Documentation**: Swagger/OpenAPI documentation

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request




