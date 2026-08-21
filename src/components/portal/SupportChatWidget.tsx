import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  Bot,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const SupportChatWidget: React.FC = () => {
  const { supportChats, sendSupportMessage, currentUser, systemSettings, t, language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChatId = currentUser ? `chat_${currentUser.id}` : 'chat_guest';
  const currentChat = supportChats.find(c => c.id === currentChatId || c.userId === currentUser?.id) || supportChats[0];
  const messagesList = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [supportChats, isOpen]);

  if (systemSettings && systemSettings.enableSupportChat === false) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Send traveler message
    sendSupportMessage(currentChatId, userMessage, currentUser?.role === 'admin' ? 'admin' : 'traveler');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{t('appName')} Concierge</h4>
                <div className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>24/7 Live Tour Specialist</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/50">
            <div className="text-center">
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                {t('appName')} Verified Concierge Channel
              </span>
            </div>

            {messagesList.map(msg => {
              const isTraveler = msg.senderRole === 'traveler';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isTraveler ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isTraveler ? 'bg-sky-600 text-white' : 'bg-teal-600 text-white'
                    }`}
                  >
                    {isTraveler ? (language === 'km' ? 'ខ្ញុំ' : 'Me') : 'KHB'}
                  </div>
                  <div
                    className={`max-w-[78%] p-3 rounded-2xl text-xs space-y-1 ${
                      isTraveler
                        ? 'bg-sky-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="text-[10px] opacity-70 font-semibold">{msg.senderName}</div>
                    <div className="leading-relaxed">{msg.text}</div>
                    <div className={`text-[9px] text-right opacity-60`}>
                      {msg.timestamp.split('T')[1]?.slice(0, 5) || (language === 'km' ? 'ឥឡូវនេះ' : 'Just now')}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px]">Concierge is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask concierge a question..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 text-white shadow-xl shadow-sky-500/30 hover:scale-105 transition-all flex items-center justify-center cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        <span className="sr-only">Open Concierge Chat</span>
      </button>
    </div>
  );
};
