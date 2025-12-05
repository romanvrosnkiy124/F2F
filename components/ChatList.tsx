
import React from 'react';
import { User, ChatSession, Event } from '../types';
import { MessageSquare, Sparkles, Calendar, Users } from 'lucide-react';

interface ChatListProps {
  sessions: ChatSession[];
  users: User[];
  events: Event[];
  onSelectChat: (sessionId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ sessions, users, events, onSelectChat }) => {
  // Split sessions into categories
  const newMatches = sessions.filter(s => s.type === 'direct' && s.messages.length === 0);
  const activeDirectChats = sessions.filter(s => s.type === 'direct' && s.messages.length > 0);
  const eventChats = sessions.filter(s => s.type === 'event');

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <MessageSquare size={40} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет сообщений</h3>
        <p className="text-sm">Лайкайте людей или присоединяйтесь к событиям, чтобы начать общение!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* New Matches Section (Horizontal Scroll) */}
      {newMatches.length > 0 && (
        <div className="p-4 pb-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-pink-500" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Новые пары</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {newMatches.map((session) => {
              const user = users.find(u => u.id === session.id);
              if (!user) return null;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectChat(session.id)}
                  className="flex flex-col items-center gap-2 min-w-[4.5rem] group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-pink-500">
                        <img 
                            src={user.photoUrl} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 truncate w-full text-center group-hover:text-indigo-600">
                    {user.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        
        {/* Event Chats Section */}
        {eventChats.length > 0 && (
            <div className="p-4 pb-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Чаты событий</h3>
                <div className="space-y-2 mb-4">
                    {eventChats.map((session) => {
                        const event = events.find(e => e.id === session.id);
                        if (!event) return null;
                        const lastMessage = session.messages[session.messages.length - 1];

                        return (
                            <button
                                key={session.id}
                                onClick={() => onSelectChat(session.id)}
                                className="flex items-center gap-4 p-3 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors text-left w-full border border-indigo-100"
                            >
                                <div className="w-12 h-12 rounded-xl bg-indigo-200 flex items-center justify-center shrink-0">
                                    <Calendar size={24} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                                    <p className="text-xs text-indigo-600 flex items-center gap-1 mb-1">
                                        <Users size={10} />
                                        {event.participantsIds.length} участников
                                    </p>
                                    <p className="text-sm text-gray-600 truncate">
                                        {lastMessage ? lastMessage.text : 'Чат события создан'}
                                    </p>
                                </div>
                                {session.unread > 0 && (
                                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-[10px] font-bold">{session.unread}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Active Direct Chats Section */}
        {activeDirectChats.length > 0 && (
            <div className="p-4 pt-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Сообщения</h3>
                <div className="divide-y divide-gray-100">
                {activeDirectChats.map((session) => {
                    const user = users.find(u => u.id === session.id);
                    if (!user) return null;
                    
                    const lastMessage = session.messages[session.messages.length - 1];
                    
                    return (
                    <button
                        key={session.id}
                        onClick={() => onSelectChat(session.id)}
                        className="flex items-center gap-4 p-4 -mx-4 hover:bg-gray-50 transition-colors text-left w-full"
                    >
                        <div className="relative">
                        <img 
                            src={user.photoUrl} 
                            alt={user.name} 
                            className="w-14 h-14 rounded-full object-cover border border-gray-200"
                        />
                        {session.unread > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{session.unread}</span>
                            </div>
                        )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                            <span className="text-xs text-gray-400">
                            {new Date(lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className={`text-sm truncate ${session.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {lastMessage.senderId === user.id ? '' : 'Вы: '} {lastMessage.text}
                        </p>
                        </div>
                    </button>
                    );
                })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
