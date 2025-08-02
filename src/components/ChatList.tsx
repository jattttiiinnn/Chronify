import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Video, Phone, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatWindow from './ChatWindow';
import { Chat, Message } from '../types/chat';
import axios from 'axios';
import io from 'socket.io-client';

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState<{[key: string]: number}>({});
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, chatId: string}>>([]);

  useEffect(() => {
    fetchChats();
    
    // Setup socket for notifications
    const socket = io('http://localhost:5000');
    
    socket.on('new-message', (newMessage: any) => {
      // Only show notification if chat is not currently selected
      if (!selectedChat || selectedChat._id !== newMessage.chatId) {
        const senderName = newMessage.senderId.name;
        const notificationId = Date.now().toString();
        
        setNotifications(prev => [...prev, {
          id: notificationId,
          message: `New message from ${senderName}`,
          chatId: newMessage.chatId
        }]);
        
        setUnreadMessages(prev => ({
          ...prev,
          [newMessage.chatId]: (prev[newMessage.chatId] || 0) + 1
        }));
        
        // Auto remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 5000);
      }
      
      // Update chats list
      fetchChats();
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Clear unread messages when chat is selected
    if (selectedChat) {
      setUnreadMessages(prev => ({
        ...prev,
        [selectedChat._id]: 0
      }));
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/my');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
    setLoading(false);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const openChatFromNotification = (chatId: string, notificationId: string) => {
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setSelectedChat(chat);
      setUnreadMessages(prev => ({
        ...prev,
        [chatId]: 0
      }));
    }
    removeNotification(notificationId);
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p._id !== user?.id);
  };

  const getLastMessage = (chat: Chat) => {
    if (chat.messages.length === 0) return 'No messages yet';
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white border border-purple-200 rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => openChatFromNotification(notification.chatId, notification.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex h-[600px]">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-gray-200 bg-white/50 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
              Messages
            </h2>
          </div>
          
          <div className="overflow-y-auto flex-1 min-h-0">
            {chats.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No conversations yet</p>
                <p className="text-sm">Start chatting with skill partners!</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherParticipant = getOtherParticipant(chat);
                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-purple-50 transition-colors ${
                      selectedChat?._id === chat._id ? 'bg-purple-100' : ''
                    } relative`}
                  >
                    {unreadMessages[chat._id] > 0 && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadMessages[chat._id]}
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {otherParticipant?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800">
                          {otherParticipant?.name}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {getLastMessage(chat)}
                        </div>
                        {chat.sessionId && (
                          <div className="text-xs text-purple-600 mt-1">
                            Session: {chat.sessionId.skillName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <ChatWindow 
              chat={selectedChat} 
              currentUserId={user?.id} 
              onChatUpdate={fetchChats}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}