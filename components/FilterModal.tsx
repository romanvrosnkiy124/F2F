import React from 'react';
import { Interest, FilterState } from '../types';
import { Button } from './Button';
import { X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, setFilters }) => {
  if (!isOpen) return null;

  const toggleInterest = (interest: Interest) => {
    const current = filters.interests;
    const isSelected = current.includes(interest);
    if (isSelected) {
      setFilters({ ...filters, interests: current.filter(i => i !== interest) });
    } else {
      setFilters({ ...filters, interests: [...current, interest] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Фильтры</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Gender */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Пол</h3>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {(['all', 'male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters({ ...filters, gender: g })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.gender === g 
                      ? 'bg-white shadow text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {g === 'all' ? 'Все' : g === 'male' ? 'Парни' : 'Девушки'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">
              Возраст: {filters.ageRange[0]} - {filters.ageRange[1]}
            </h3>
            <div className="px-2">
              <input 
                type="range" 
                min="18" 
                max="60" 
                value={filters.ageRange[1]}
                onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Интересы</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(Interest).map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.interests.includes(interest)
                      ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <Button fullWidth onClick={onClose}>
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
};