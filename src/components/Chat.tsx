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
    <div className="flex flex-col h-full bg-white rounded-3xl border border-black/5 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-black p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-xs sm:text-sm">Asistente RepuestosIA</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest">En línea</span>
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
              "flex gap-3 max-w-[85%]",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              m.role === 'user' ? "bg-gray-200 text-gray-600" : "bg-indigo-100 text-indigo-600"
            )}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={cn(
              "p-3.5 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-black text-white rounded-tr-none shadow-md" 
                : "bg-white text-gray-800 rounded-tl-none border border-black/5 shadow-sm"
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
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-black/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej: Pastillas de freno Hilux"
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-300"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[8px] sm:text-[10px] text-gray-400 mt-2 text-center uppercase font-bold tracking-widest">
          Gemini AI & Google Sheets
        </p>
      </form>
    </div>
  );
}
