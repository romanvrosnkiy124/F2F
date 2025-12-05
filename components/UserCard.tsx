import React from 'react';
import { User } from '../types';
import { MapPin, Info } from 'lucide-react';

interface UserCardProps {
  user: User;
  currentUser?: User;
  distance: number | null;
  onInfoClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, currentUser, distance, onInfoClick }) => {
  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-200">
      {/* Image */}
      <img 
        src={user.photoUrl} 
        alt={user.name} 
        className="w-full h-3/4 object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-3/4 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Content */}
      <div className="absolute bottom-0 w-full h-1/3 bg-white p-5 flex flex-col rounded-t-3xl -mt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {user.name}, {user.age}
            </h2>
            {distance !== null && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {distance < 1 ? '< 1' : Math.round(distance)} км от вас
              </p>
            )}
          </div>
          {onInfoClick && (
             <button onClick={onInfoClick} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full">
               <Info size={24} />
             </button>
          )}
        </div>

        {/* Interests Badges */}
        <div className="flex flex-wrap gap-2 mt-2 overflow-hidden max-h-16">
          {user.interests.slice(0, 5).map((interest, idx) => {
            const isCommon = currentUser?.interests.includes(interest);
            return (
                <span 
                key={idx} 
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                    isCommon 
                    ? "bg-green-100 text-green-700 border-green-200" 
                    : "bg-indigo-50 text-indigo-700 border-transparent"
                }`}
                >
                {interest}
                </span>
            );
          })}
          {user.interests.length > 5 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
              +{user.interests.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};