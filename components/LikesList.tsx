
import React from 'react';
import { User } from '../types';
import { Heart, X, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface LikesListProps {
  incomingLikes: string[];
  users: User[];
  currentUser: User;
  onAccept: (user: User) => void;
  onReject: (userId: string) => void;
}

export const LikesList: React.FC<LikesListProps> = ({ 
  incomingLikes, 
  users, 
  currentUser,
  onAccept, 
  onReject 
}) => {
  const likedUsers = users.filter(u => incomingLikes.includes(u.id));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-2 px-4 py-4 bg-white border-b border-gray-100">
         <div className="p-2 bg-pink-100 rounded-full">
            <Heart className="text-pink-500 fill-pink-500" size={20} />
         </div>
         <div>
            <h2 className="text-xl font-bold text-gray-900">Вас лайкнули</h2>
            <p className="text-xs text-gray-500">
                {likedUsers.length} {likedUsers.length === 1 ? 'человек' : 'человека'} хотят подружиться
            </p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {likedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Heart size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Пока пусто</h3>
            <p className="text-sm max-w-xs">Как только кто-то лайкнет ваш профиль, он появится здесь.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likedUsers.map(user => {
                const commonInterests = user.interests.filter(i => currentUser.interests.includes(i));
                const isMatchable = commonInterests.length >= 3;

                return (
                    <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="relative h-40">
                            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                            {/* Blur overlay if not premium? Naah, let's show them. */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                <h3 className="text-white font-bold text-sm">{user.name}, {user.age}</h3>
                            </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-1 mb-3">
                                {commonInterests.slice(0, 2).map((interest, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] rounded font-medium border border-green-100">
                                        {interest}
                                    </span>
                                ))}
                                {commonInterests.length > 2 && (
                                    <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded font-medium">+{commonInterests.length - 2}</span>
                                )}
                            </div>
                            
                            {!isMatchable && (
                                <p className="text-[10px] text-red-400 mb-2">Недостаточно общих интересов для матча ({commonInterests.length}/3)</p>
                            )}

                            <div className="mt-auto flex gap-2">
                                <button 
                                    onClick={() => onReject(user.id)}
                                    className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} className="mx-auto" />
                                </button>
                                <button 
                                    onClick={() => onAccept(user)}
                                    className={`flex-1 py-2 rounded-xl text-white shadow-md transition-transform active:scale-95 ${
                                        isMatchable 
                                        ? 'bg-gradient-to-r from-pink-500 to-red-500 shadow-pink-200' 
                                        : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                                    disabled={!isMatchable}
                                >
                                    <Heart size={20} className="mx-auto fill-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
