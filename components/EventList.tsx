import React, { useState } from 'react';
import { Event, User } from '../types';
import { EventCard } from './EventCard';
import { Button } from './Button';
import { Calendar, Plus } from 'lucide-react';

interface EventListProps {
  events: Event[];
  users: User[];
  currentUser: User;
  onJoinEvent: (eventId: string) => void;
  onCreateEventClick: () => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  users, 
  currentUser, 
  onJoinEvent, 
  onCreateEventClick 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter my events
  const myEvents = sortedEvents.filter(e => e.organizerId === currentUser.id);
  const hasMyEvents = myEvents.length > 0;

  // Determine events to show
  const displayedEvents = activeTab === 'my' ? myEvents : sortedEvents;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-4">
           <div>
              <h2 className="text-xl font-bold text-gray-900">События рядом</h2>
              <p className="text-xs text-gray-500">Найдите компанию по интересам</p>
           </div>
           <Button size="sm" onClick={onCreateEventClick} className="flex items-center gap-1">
              <Plus size={18} />
              <span className="hidden sm:inline">Создать</span>
           </Button>
        </div>

        {/* Tabs - only visible if user has created events */}
        {hasMyEvents && (
          <div className="flex px-4 gap-6">
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Все события
            </button>
            <button 
              onClick={() => setActiveTab('my')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'my' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Мои события
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'my' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {myEvents.length}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {displayedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>Событий пока нет.</p>
            {activeTab === 'my' ? (
                <p className="text-sm mt-1 mb-4">Вы пока не создали ни одного события.</p>
            ) : (
                <p className="text-sm mt-1 mb-4">Станьте первым организатором!</p>
            )}
            
            <Button variant="outline" onClick={onCreateEventClick}>
              Создать событие
            </Button>
          </div>
        ) : (
          displayedEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              currentUser={currentUser}
              organizer={users.find(u => u.id === event.organizerId)}
              onJoin={onJoinEvent}
            />
          ))
        )}
        
        {/* Floating Action Button for mobile if list is long */}
        {displayedEvents.length > 0 && (
           <button 
             onClick={onCreateEventClick}
             className="sm:hidden fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform active:scale-95 z-30"
           >
             <Plus size={28} />
           </button>
        )}
      </div>
    </div>
  );
};