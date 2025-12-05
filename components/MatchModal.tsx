import React from 'react';
import { User } from '../types';
import { Button } from './Button';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: () => void;
  currentUser: User;
  matchedUser: User | null;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  currentUser,
  matchedUser
}) => {
  if (!isOpen || !matchedUser) return null;

  const commonInterests = currentUser.interests.filter(i => matchedUser.interests.includes(i));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center shadow-2xl relative overflow-hidden transform transition-all scale-100">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-20 -left-10 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-60"></div>

        <div className="mb-6 flex justify-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-2">
                <Sparkles className="text-yellow-400 w-8 h-8 fill-yellow-400" />
            </div>
        </div>

        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600 mb-2 font-italic italic transform -rotate-2">
          It's a Match!
        </h2>
        <p className="text-gray-500 mb-8 font-medium">Вы и {matchedUser.name} теперь друзья</p>

        <div className="flex justify-center items-center gap-4 mb-8 relative">
            <div className="relative transform -rotate-6 transition-transform hover:rotate-0 z-10">
                <img src={currentUser.photoUrl} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
            </div>
            <div className="absolute z-20 bg-white rounded-full p-2 shadow-lg border border-pink-100 animate-bounce">
                 <span className="text-2xl block">🤝</span>
            </div>
            <div className="relative transform rotate-6 transition-transform hover:rotate-0 z-10">
                <img src={matchedUser.photoUrl} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
            </div>
        </div>

        <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider text-[10px]">Общие интересы</p>
            <div className="flex flex-wrap justify-center gap-2">
                {commonInterests.slice(0, 3).map(i => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs rounded-full font-bold">
                        {i}
                    </span>
                ))}
                {commonInterests.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 border border-gray-200 text-xs rounded-full font-bold">+{commonInterests.length - 3}</span>
                )}
            </div>
        </div>

        <div className="space-y-3">
            <Button fullWidth onClick={onStartChat} className="bg-gradient-to-r from-indigo-600 to-pink-600 border-0 shadow-lg shadow-indigo-200 hover:shadow-xl transform transition-transform active:scale-95 py-3 h-auto text-lg rounded-2xl">
                <MessageCircle size={20} className="mr-2 fill-white/20" />
                Написать сообщение
            </Button>
            <Button fullWidth variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-transparent font-medium">
                Продолжить поиск
            </Button>
        </div>
      </div>
    </div>
  );
};