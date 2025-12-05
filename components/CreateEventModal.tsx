import React, { useState } from 'react';
import { Interest } from '../types';
import { Button } from './Button';
import { X, Calendar, MapPin, Type } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    locationName: '',
    tags: [] as Interest[],
  });

  if (!isOpen) return null;

  const toggleTag = (tag: Interest) => {
    if (formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.locationName) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }
    
    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: dateTime,
      locationName: formData.locationName,
      tags: formData.tags
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Создать событие</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название события</label>
                <div className="relative">
                    <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Например: Пробежка в парке"
                        required
                    />
                </div>
            </div>

            {/* Date & Time */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                    <div className="relative">
                        <input 
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>
                <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Время</label>
                    <input 
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Место встречи</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text"
                        value={formData.locationName}
                        onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Адрес или название места"
                        required
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    placeholder="Подробности для участников..."
                />
            </div>

            {/* Interests */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категории интересов</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {Object.values(Interest).map((interest) => (
                        <button
                            key={interest}
                            type="button"
                            onClick={() => toggleTag(interest)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                formData.tags.includes(interest)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            <Button fullWidth type="submit" className="mt-4">
              Создать событие
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};