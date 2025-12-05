import React, { useState, useRef } from 'react';
import { User, Interest } from '../types';
import { Button } from './Button';
import { User as UserIcon, Camera, AlignLeft, ArrowRight, Heart, Upload } from 'lucide-react';

interface RegistrationFormProps {
  initialData: User;
  onComplete: (user: User) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ initialData, onComplete }) => {
  const [formData, setFormData] = useState<User>(initialData);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleInterest = (interest: Interest) => {
    const current = formData.interests;
    if (current.includes(interest)) {
      setFormData({ ...formData, interests: current.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...current, interest] });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.age) {
        alert("Пожалуйста, заполните имя и возраст");
        return;
      }
      setStep(2);
    } else {
      if (formData.interests.length < 2) {
        alert("Пожалуйста, выберите минимум 2 интереса");
        return;
      }
      onComplete(formData);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50 to-white -z-10 rounded-b-[3rem]"></div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-2xl shadow-lg mb-4">
            <Heart className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">F2F</h1>
          <p className="text-gray-500">Найди друзей по интересам</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8 justify-center">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`}></div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fade-in">
          
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Расскажите о себе</h2>
              
              {/* Photo Upload */}
              <div className="flex justify-center">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div 
                    className="relative group cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={triggerFileInput}
                    title="Загрузить фото"
                  >
                      <img 
                          src={formData.photoUrl || "https://via.placeholder.com/150"} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50 bg-gray-100 shadow-sm"
                      />
                      <div className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full border-2 border-white shadow-md">
                          <Camera size={16} />
                      </div>
                  </div>
              </div>
              <p className="text-center text-xs text-gray-400 -mt-2">Нажмите на фото, чтобы загрузить</p>

              {/* Name */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                  <div className="relative">
                      <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Как вас зовут?"
                      />
                  </div>
              </div>

              {/* Age & Gender */}
              <div className="flex gap-4">
                  <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Возраст</label>
                      <input 
                          type="number"
                          value={formData.age || ''}
                          onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="18+"
                      />
                  </div>
                   <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Пол</label>
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        {(['male', 'female'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              formData.gender === g 
                                ? 'bg-white shadow text-indigo-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {g === 'male' ? 'М' : 'Ж'}
                          </button>
                        ))}
                      </div>
                  </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Ваши увлечения</h2>
                <p className="text-center text-sm text-gray-500 -mt-3 mb-4">Выберите минимум 2 интереса</p>

                {/* Bio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Кратко о себе</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                            placeholder="Что вы любите делать в свободное время?"
                        />
                    </div>
                </div>

                {/* Interests */}
                <div className="max-h-60 overflow-y-auto pr-1">
                    <div className="flex flex-wrap gap-2">
                        {Object.values(Interest).map((interest) => (
                            <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                    formData.interests.includes(interest)
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </div>
                 {formData.interests.length < 2 && (
                    <p className="text-center text-red-500 text-xs">Ещё {2 - formData.interests.length}...</p>
                 )}
             </div>
          )}

          <div className="mt-8">
            <Button fullWidth onClick={handleNext} className="bg-gradient-to-r from-indigo-600 to-pink-500 text-lg shadow-lg shadow-indigo-200">
               {step === 1 ? 'Продолжить' : 'Создать профиль'} 
               {step === 1 && <ArrowRight size={20} className="ml-2" />}
            </Button>
            {step === 2 && (
                <button 
                    onClick={() => setStep(1)} 
                    className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600"
                >
                    Назад
                </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};