
export enum Interest {
  GYM = 'Тренажёрный зал',
  FISHING = 'Рыбалка',
  HUNTING = 'Охота',
  FITNESS = 'Фитнес',
  RUNNING = 'Бег',
  READING = 'Чтение',
  TRAVEL = 'Путешествия',
  GAMING = 'Видеоигры',
  COOKING = 'Кулинария',
  ART = 'Искусство',
  MUSIC = 'Музыка',
  HIKING = 'Туризм',
  COFFEE = 'Кофе',
}

export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  photoUrl: string;
  bio: string;
  interests: Interest[];
  location: {
    lat: number;
    lng: number;
  };
  distance?: number; // Calculated distance in km
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // User ID or Event ID
  text: string;
  timestamp: number;
  isAiGenerated?: boolean;
}

export interface ChatSession {
  id: string; // userId for direct, eventId for events
  type: 'direct' | 'event';
  eventId?: string; // Only for event type
  messages: Message[];
  unread: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  locationName: string;
  organizerId: string;
  participantsIds: string[]; // List of user IDs who joined
  tags: Interest[];
}

export interface FilterState {
  ageRange: [number, number];
  gender: 'all' | 'male' | 'female';
  interests: Interest[];
}

export type AppView = 'swipe' | 'map' | 'chat' | 'profile' | 'events' | 'register' | 'likes';
