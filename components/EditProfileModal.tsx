
import React, { useState, useEffect, useRef } from 'react';
import { User, Interest } from '../types';
import { Button } from './Button';
import { X, User as UserIcon, Camera, AlignLeft } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdate: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [formData, setFormData] = useState<User>(currentUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when currentUser prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
        setFormData(currentUser);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const toggleInterest = (interest: Interest) => {
    const current = formData.interests;
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Редактировать профиль</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Photo Upload */}
            <div className="flex flex-col items-center justify-center mb-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div 
                  className="relative group cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                    <img 
                        src={formData.photoUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50"
                    />
                    <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white">
                        <Camera size={14} />
                    </div>
                </div>
                <button 
                  type="button" 
                  className="text-indigo-600 text-xs mt-2 font-medium hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Изменить фото
                </button>
            </div>

            {/* Name & Age */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Возраст</label>
                    <input 
                        type="number"
                        min="18"
                        max="99"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 18})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Пол</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.gender === g 
                          ? 'bg-white shadow text-indigo-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {g === 'male' ? 'Мужской' : 'Женский'}
                    </button>
                  ))}
                </div>
            </div>

            {/* Bio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                        placeholder="Расскажите немного о себе..."
                    />
                </div>
            </div>

            {/* Interests */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Интересы <span className="text-gray-400 font-normal text-xs">(минимум 2)</span>
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {Object.values(Interest).map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                formData.interests.includes(interest)
                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
                {formData.interests.length < 2 && (
                    <p className="text-red-500 text-xs mt-1">Выберите минимум 2 интереса</p>
                )}
            </div>

            <Button 
                fullWidth 
                type="submit" 
                className="mt-4"
                disabled={formData.interests.length < 2}
            >
              Сохранить изменения
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
