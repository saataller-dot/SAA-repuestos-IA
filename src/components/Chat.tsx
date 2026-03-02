import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { Message } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export function Chat({ messages, onSendMessage, isLoading }: ChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 p-3 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h2 className="text-white font-black text-xs sm:text-sm tracking-tight">Asistente IA</h2>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[#F9FAFB]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg">¿En qué puedo ayudarte hoy?</h3>
              <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
                Dime qué repuesto buscas y para qué vehículo, y yo lo encontraré por ti.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-3 max-w-[90%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
              m.role === 'user' ? "bg-gray-200 text-gray-600" : "bg-indigo-100 text-indigo-600"
            )}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={cn(
              "p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-gray-900 text-white rounded-tr-none shadow-lg shadow-gray-100" 
                : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm"
            )}>
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-black/5 shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs text-gray-500 font-medium">Buscando en inventario...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-white border-t border-gray-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Pastillas de freno Hilux"
            disabled={isLoading}
            className="w-full pl-6 pr-14 py-4 sm:py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all disabled:opacity-50 placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[9px] text-gray-300 mt-3 text-center uppercase font-black tracking-[0.2em]">
          AI Powered Inventory
        </p>
      </form>
    </div>
  );
}
