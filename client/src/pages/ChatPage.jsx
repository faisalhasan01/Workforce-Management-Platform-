import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Hash, Send, Users, Sparkles, Smile, Paperclip } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';
import { useSocket } from '../context/SocketContext';

export const ChatPage = () => {
  const { user } = useAuth();
  const { activeOrg } = useOrg();
  const { socket, joinChannel, leaveChannel } = useSocket();

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch channel list
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await api.get('/chat/channels');
        if (res.data.success) {
          setChannels(res.data.channels);
        }
      } catch (err) {
        console.error('Failed to load channels:', err);
      }
    };

    fetchChannels();
  }, [activeOrg?._id]);

  // Fetch messages for active channel & join socket room
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/channels/${activeChannel}/messages`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    joinChannel(activeChannel);

    return () => {
      leaveChannel(activeChannel);
    };
  }, [activeChannel, activeOrg?._id]);

  // Real-time socket message handler
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.channel === activeChannel) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message', handleNewMessage);

    return () => {
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, activeChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.post(`/chat/channels/${activeChannel}/messages`, {
        content: messageText,
      });

      if (res.data.success) {
        // If not delivered via socket yet, append
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const currentChannelObj = channels.find((c) => c.id === activeChannel);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/70 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>Channels ({channels.length})</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((chan) => {
            const isActive = chan.id === activeChannel;
            return (
              <button
                key={chan.id}
                onClick={() => setActiveChannel(chan.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Hash className="w-3.5 h-3.5 opacity-70" />
                <span className="truncate">{chan.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {/* Channel Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-white">
              {currentChannelObj?.name || activeChannel}
            </h2>
            <span className="text-xs text-slate-500">
              — {currentChannelObj?.description || 'Project & organization discussions'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-Time Connected</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Loading channel messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-xs">No messages in #{activeChannel} yet. Be the first to post!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              return (
                <div key={msg._id} className="flex items-start space-x-3 text-xs group">
                  <img
                    src={
                      msg.sender?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.sender?.name || 'User')}`
                    }
                    alt={msg.sender?.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-bold text-slate-200">
                        {msg.sender?.name || 'Colleague'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="mt-1 text-slate-300 text-xs leading-relaxed bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-xl rounded-tl-none inline-block max-w-xl">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs focus:outline-none focus:border-brand-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center space-x-1.5 shadow-lg shadow-brand-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
