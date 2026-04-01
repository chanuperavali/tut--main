import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  messages: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose, userName, messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setIsLoading(true);

    // precise timestamp
    const userMsg: ChatMessage = { role: 'user', text: userQuery, timestamp: Date.now() };
    onSendMessage(userMsg);

    try {
      const response = await getChatResponse(userQuery);
      const aiMsg: ChatMessage = { role: 'ai', text: response, timestamp: Date.now() };
      onSendMessage(aiMsg);
    } catch (err) {
      console.error(err);
      onSendMessage({ role: 'ai', text: "Sorry, I encountered an error.", timestamp: Date.now() });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-palette-dark/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="bg-palette-cream w-full max-w-lg rounded-[32px] overflow-hidden custom-shadow flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 duration-300 border border-palette-lightBeige">
        {/* Header */}
        <div className="p-6 bg-palette-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-white font-black text-lg leading-tight">Fast Assistant</h3>
              <p className="text-palette-grey text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-palette-beige rounded-full animate-pulse"></span>
                Instant Mode
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar min-h-[300px] bg-white">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${m.role === 'user'
                ? 'bg-palette-dark text-white rounded-tr-none'
                : 'bg-palette-cream text-palette-dark rounded-tl-none border border-palette-lightBeige'
                }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-palette-cream p-4 rounded-3xl rounded-tl-none flex gap-1 items-center border border-palette-lightBeige">
                <div className="w-1.5 h-1.5 bg-palette-dark rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-palette-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-palette-dark rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-palette-lightBeige bg-white">
          <div className="flex gap-3 bg-palette-cream p-2 rounded-2xl border border-palette-lightBeige">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for clarification..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium text-palette-dark placeholder-palette-grey"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-palette-dark rounded-xl flex items-center justify-center text-white disabled:bg-palette-grey transition-colors"
            >
              <svg className="w-5 h-5 rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
          <p className="text-center text-[9px] font-black text-palette-grey uppercase tracking-widest mt-4">
            Low Latency Clarification Engine
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;
