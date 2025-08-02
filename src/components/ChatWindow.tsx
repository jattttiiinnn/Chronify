import React, { useState, useEffect, useRef } from 'react';
import { Send, Video, Phone, MoreVertical, X } from 'lucide-react';
import VideoCall from './VideoCall';
import io from 'socket.io-client';

interface Message {
  _id: string;
  senderId: { _id: string; name: string };
  content: string;
  timestamp: string;
  messageType: string;
}

interface Chat {
  _id: string;
  participants: Array<{ _id: string; name: string; email: string }>;
  messages: Message[];
  sessionId?: { _id: string; skillName: string; status: string };
}

interface ChatWindowProps {
  chat: Chat;
  currentUserId?: string;
  onChatUpdate: () => void;
}

export default function ChatWindow({ chat, currentUserId, onChatUpdate }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callInitiator, setCallInitiator] = useState<string>('');
  const [socket, setSocket] = useState<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = chat.participants.find(p => p._id !== currentUserId);

  // Socket connection and event handling
  useEffect(() => {
    console.log('ChatWindow: Initializing socket for chat:', chat._id);
    
    // Create socket connection with reconnection options
    const newSocket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection established
    const onConnect = () => {
      console.log('ChatWindow: Socket connected successfully');
      setSocketConnected(true);
      
      // Rejoin chat room on reconnect
      newSocket.emit('join-chat', chat._id);
      console.log('ChatWindow: Rejoined chat room after reconnection:', chat._id);
    };

    // Connection lost
    const onDisconnect = (reason: string) => {
      console.log('ChatWindow: Socket disconnected. Reason:', reason);
      setSocketConnected(false);
      
      // Attempt to reconnect if not explicitly disconnected
      if (reason !== 'io client disconnect') {
        console.log('ChatWindow: Attempting to reconnect...');
      }
    };

    // Handle connection errors
    const onConnectError = (error: Error) => {
      console.error('ChatWindow: Socket connection error:', error);
      setSocketConnected(false);
    };

    // Set up event listeners
    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);

    // Join chat room
    newSocket.emit('join-chat', chat._id);
    console.log('ChatWindow: Joined chat room:', chat._id);

    // Message handling
    const onNewMessage = (newMessage: Message) => {
      console.log('ChatWindow: Received new message:', newMessage);
      setMessages(prev => [...prev, newMessage]);
    };

    // Video call handling
    const onIncomingVideoCall = (data: any) => {
      console.log('ChatWindow: Incoming video call received:', data);
      
      if (data.from !== currentUserId) {
        console.log('ChatWindow: Showing incoming call modal');
        setIncomingCall(true);
        setCallInitiator(data.from);
      } else {
        console.log('ChatWindow: Ignoring call from self');
      }
    };

    const onCallAccepted = () => {
      console.log('ChatWindow: Call accepted, starting video call');
      setShowVideoCall(true);
      setIncomingCall(false);
    };

    const onCallRejected = () => {
      console.log('ChatWindow: Call rejected');
      setIncomingCall(false);
      alert('Call was rejected');
    };

    const onCallEnded = () => {
      console.log('ChatWindow: Call ended');
      setShowVideoCall(false);
      setIncomingCall(false);
    };

    // Set up message and call event listeners
    newSocket.on('new-message', onNewMessage);
    newSocket.on('incoming-video-call', onIncomingVideoCall);
    newSocket.on('call-accepted', onCallAccepted);
    newSocket.on('call-rejected', onCallRejected);
    newSocket.on('call-ended', onCallEnded);

    // Set the socket in state
    setSocket(newSocket);

    // Cleanup function
    const cleanup = () => {
      console.log('ChatWindow: Cleaning up socket connection');
      
      // Remove all event listeners
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('connect_error', onConnectError);
      newSocket.off('new-message', onNewMessage);
      newSocket.off('incoming-video-call', onIncomingVideoCall);
      newSocket.off('call-accepted', onCallAccepted);
      newSocket.off('call-rejected', onCallRejected);
      newSocket.off('call-ended', onCallEnded);
      
      // Disconnect the socket
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };

    return cleanup;
  }, [chat._id]);

  useEffect(() => {
    setMessages(chat.messages);
  }, [chat.messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    console.log('ChatWindow: Sending message:', message.trim());
    socket.emit('send-message', {
      chatId: chat._id,
      senderId: currentUserId,
      content: message.trim()
    });

    setMessage('');
  };

  const startVideoCall = () => {
    console.log('ChatWindow: Video call button clicked');
    console.log('ChatWindow: Socket connected?', socketConnected);
    console.log('ChatWindow: Socket object:', socket);
    console.log('ChatWindow: Current user ID:', currentUserId);
    console.log('ChatWindow: Other participant:', otherParticipant);
    
    if (!socket) {
      console.error('ChatWindow: Socket not available');
      alert('Connection not available. Please refresh the page.');
      return;
    }
    
    if (!socketConnected) {
      console.error('ChatWindow: Socket not connected');
      alert('Not connected to server. Please check your connection.');
      return;
    }
    
    if (!otherParticipant) {
      console.error('ChatWindow: No other participant found');
      alert('Cannot find other participant');
      return;
    }
    
    console.log('ChatWindow: Emitting initiate-video-call event');
    try {
      socket.emit('initiate-video-call', {
        chatId: chat._id,
        from: currentUserId,
        to: otherParticipant._id,
        fromName: 'You'
      });
      console.log('ChatWindow: Video call request sent successfully');
    } catch (error) {
      console.error('ChatWindow: Error sending video call request:', error);
      alert('Failed to initiate video call');
    }
  };

  const acceptCall = () => {
    console.log('ChatWindow: Accepting call');
    if (socket) {
      console.log('Emitting accept-video-call with data:', {
        chatId: chat._id,
        to: callInitiator
      });
      socket.emit('accept-video-call', {
        chatId: chat._id,
        to: callInitiator
      });
      
      // Also join the room if not already joined
      socket.emit('join-chat', chat._id);
    }
    setIncomingCall(false);
    setShowVideoCall(true);
  };

  const rejectCall = () => {
    console.log('ChatWindow: Rejecting call');
    if (socket) {
      console.log('Emitting reject-video-call with data:', {
        chatId: chat._id,
        to: callInitiator
      });
      socket.emit('reject-video-call', {
        chatId: chat._id,
        to: callInitiator
      });
    }
    setIncomingCall(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (showVideoCall) {
    return (
      <VideoCall
        chatId={chat._id}
        otherParticipant={otherParticipant}
        onClose={() => {
          setShowVideoCall(false);
          if (socket) {
            socket.emit('end-video-call', {
              chatId: chat._id,
              to: otherParticipant?._id
            });
          }
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col max-h-[600px]">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Incoming Video Call
              </h3>
              <p className="text-gray-600 mb-6">
                {otherParticipant?.name} is calling you
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Video className="h-5 w-5" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {otherParticipant?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {otherParticipant?.name}
              </div>
              {chat.sessionId && (
                <div className="text-sm text-purple-600">
                  Session: {chat.sessionId.skillName}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={startVideoCall}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center"
              title="Start video call"
            >
              <Video className="h-5 w-5" />
            </button>
            <button 
              onClick={() => {
                console.log('ChatWindow: Menu button clicked');
                alert('Menu functionality coming soon!');
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center"
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="px-4 py-2 bg-gray-100 text-xs text-gray-600">
          Socket: {socketConnected ? '✅ Connected' : '❌ Disconnected'} | 
          Chat: {chat._id.slice(-6)} | 
          User: {currentUserId?.slice(-6)} | 
          Other: {otherParticipant?.name}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.senderId._id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId._id === currentUserId
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="text-sm">{msg.content}</div>
              <div
                className={`text-xs mt-1 ${
                  msg.senderId._id === currentUserId ? 'text-purple-100' : 'text-gray-500'
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white/50 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}