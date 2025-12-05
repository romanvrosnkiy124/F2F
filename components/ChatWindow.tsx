
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatSession, Event } from '../types';
import { Button } from './Button';
import { Send, Sparkles, ChevronLeft, Calendar, Users } from 'lucide-react';
import { generateIcebreaker } from '../services/geminiService';

interface ChatWindowProps {
  currentUser: User;
  session?: ChatSession;
  partner?: User; // Present if type is direct
  event?: Event; // Present if type is event
  onBack: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  currentUser, 
  session,
  partner,
  event,
  onBack, 
  onSendMessage 
}) => {
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = session?.messages || [];
  const isEventChat = session?.type === 'event';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleAiIcebreaker = async () => {
    if (!partner) return;
    setIsAiLoading(true);
    const suggestion = await generateIcebreaker(currentUser, partner);
    setInputText(suggestion);
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 shadow-sm z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={24} />
        </button>
        
        {isEventChat && event ? (
            // Event Header
            <>
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                    <p className="text-xs text-indigo-600 flex items-center gap-1">
                        <Users size={12} />
                        {event.participantsIds.length} участников
                    </p>
                </div>
            </>
        ) : partner ? (
            // Partner Header
            <>
                <img 
                src={partner.photoUrl} 
                alt={partner.name} 
                className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Онлайн
                </p>
                </div>
            </>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center mt-10 px-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
               {isEventChat ? <Users className="text-indigo-500" size={32} /> : <Sparkles className="text-indigo-500" size={32} />}
            </div>
            <p className="text-gray-500 mb-4">
                {isEventChat 
                    ? `Добро пожаловать в чат события "${event?.title}"!` 
                    : `Начните общение с ${partner?.name}!`}
            </p>
            {!isEventChat && partner && (
                <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAiIcebreaker} 
                disabled={isAiLoading}
                className="gap-2"
                >
                {isAiLoading ? 'Думаю...' : '✨ Предложить тему (AI)'}
                </Button>
            )}
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEventChat ? "Сообщение участникам..." : "Напишите сообщение..."}
            className="flex-1 bg-gray-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <Button 
            variant="primary" 
            size="icon" 
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
