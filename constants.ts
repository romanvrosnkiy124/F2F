
import { Interest, User, Event, ChatSession } from './types';

export const CURRENT_USER_ID = 'me';

// Mock location (Moscow center approx)
export const MOCK_CENTER_LAT = 55.7558;
export const MOCK_CENTER_LNG = 37.6173;

export const INITIAL_USER: User = {
  id: CURRENT_USER_ID,
  name: 'Александр',
  age: 28,
  gender: 'male',
  photoUrl: 'https://picsum.photos/id/1005/400/600',
  bio: 'Люблю активный отдых и хорошие книги.',
  // Expanded interests to demonstrate matching logic (Maria has Running, Reading, Coffee)
  interests: [Interest.GYM, Interest.READING, Interest.TRAVEL, Interest.RUNNING, Interest.COFFEE],
  location: { lat: MOCK_CENTER_LAT, lng: MOCK_CENTER_LNG },
};

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Мария',
    age: 25,
    gender: 'female',
    photoUrl: 'https://picsum.photos/id/338/400/600',
    bio: 'Ищу компанию для утренних пробежек и обсуждения книг.',
    interests: [Interest.RUNNING, Interest.READING, Interest.COFFEE],
    location: { lat: 55.7510, lng: 37.6150 }, // Close
  },
  {
    id: '2',
    name: 'Дмитрий',
    age: 30,
    gender: 'male',
    photoUrl: 'https://picsum.photos/id/1012/400/600',
    bio: 'Фанат рыбалки и охоты. Выезжаю на природу каждые выходные.',
    interests: [Interest.FISHING, Interest.HUNTING, Interest.COOKING],
    location: { lat: 55.7600, lng: 37.6200 }, // Close
  },
  {
    id: '3',
    name: 'Анна',
    age: 27,
    gender: 'female',
    photoUrl: 'https://picsum.photos/id/64/400/600',
    bio: 'Художница, люблю выставки и фитнес.',
    interests: [Interest.ART, Interest.FITNESS, Interest.MUSIC],
    location: { lat: 55.7400, lng: 37.6300 }, // Medium
  },
  {
    id: '4',
    name: 'Иван',
    age: 22,
    gender: 'male',
    photoUrl: 'https://picsum.photos/id/1025/400/600',
    bio: 'Геймер и турист. Всегда готов к приключениям.',
    interests: [Interest.GAMING, Interest.HIKING, Interest.GYM],
    location: { lat: 55.7700, lng: 37.5900 }, // Medium
  },
  {
    id: '5',
    name: 'Елена',
    age: 29,
    gender: 'female',
    photoUrl: 'https://picsum.photos/id/129/400/600',
    bio: 'Йога, книги и спокойствие.',
    // Updated interests to overlap with Alexander (Reading, Travel, Coffee) -> 3 matches
    interests: [Interest.FITNESS, Interest.READING, Interest.TRAVEL, Interest.COFFEE],
    location: { lat: 55.7200, lng: 37.6000 }, // Far
  },
  {
    id: '6',
    name: 'Сергей',
    age: 35,
    gender: 'male',
    photoUrl: 'https://picsum.photos/id/91/400/600',
    bio: 'Люблю готовить стейки и ходить в зал.',
    interests: [Interest.COOKING, Interest.GYM, Interest.HUNTING],
    location: { lat: 55.7800, lng: 37.6500 }, // Far
  }
];

export const MOCK_CHATS_INITIAL: ChatSession[] = [
  // Empty initially
];

export const MOCK_INCOMING_LIKES = ['5']; // Elena likes you

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Утренняя пробежка в Парке Горького',
    description: 'Собираемся у главного входа. Темп легкий, новичкам рады!',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    locationName: 'Парк Горького, Главный вход',
    organizerId: '1', // Maria
    participantsIds: ['1', '3'],
    tags: [Interest.RUNNING, Interest.FITNESS],
  },
  {
    id: 'e2',
    title: 'Вечер настольных игр',
    description: 'Играем в Catan и Ticket to Ride. С собой можно брать снеки.',
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    locationName: 'Антикафе "Время"',
    organizerId: '4', // Ivan
    participantsIds: ['4', '2'],
    tags: [Interest.GAMING, Interest.COFFEE],
  },
  {
    id: 'e3',
    title: 'Пленэр на набережной',
    description: 'Рисуем закат. Берите с собой материалы. Чай в термосе приветствуется.',
    date: new Date(Date.now() + 259200000).toISOString(),
    locationName: 'Крымская набережная',
    organizerId: '3', // Anna
    participantsIds: ['3'],
    tags: [Interest.ART, Interest.HIKING],
  }
];
