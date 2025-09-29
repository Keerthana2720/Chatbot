'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/lib/api';
import { Plus, MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await chatAPI.getConversations(user.id);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;
    
    try {
      const response = await chatAPI.createConversation(user.id, 'New Conversation');
      setConversations(prev => [response.data, ...prev]);
      setSelectedConversation(response.data.id);
      toast.success('New conversation created');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await chatAPI.deleteConversation(conversationId, user.id);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={createNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {conversation._count.messages} messages
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
