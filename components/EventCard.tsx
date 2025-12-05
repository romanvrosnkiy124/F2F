import React from 'react';
import { Event, User } from '../types';
import { Calendar, MapPin, Users, Check } from 'lucide-react';
import { Button } from './Button';

interface EventCardProps {
  event: Event;
  currentUser: User;
  organizer?: User;
  onJoin: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, currentUser, organizer, onJoin }) => {
  const isJoined = event.participantsIds.includes(currentUser.id);
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const timeStr = dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Calendar size={14} />
            <span className="capitalize">{dateStr} в {timeStr}</span>
          </div>
        </div>
        {organizer && (
            <img 
                src={organizer.photoUrl} 
                alt={organizer.name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                title={`Организатор: ${organizer.name}`}
            />
        )}
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
        <MapPin size={16} className="shrink-0 mt-0.5" />
        <span>{event.locationName}</span>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{event.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags.map((tag, idx) => (
          <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-gray-500 text-sm">
           <Users size={16} />
           <span>{event.participantsIds.length} уч.</span>
        </div>
        
        <Button 
          variant={isJoined ? "outline" : "primary"} 
          size="sm" 
          onClick={() => onJoin(event.id)}
          className={isJoined ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : ""}
        >
          {isJoined ? (
            <>
                <Check size={16} className="mr-1" />
                Вы идете
            </>
          ) : "Присоединиться"}
        </Button>
      </div>
    </div>
  );
};