
import React, { useState, useMemo } from 'react';
import { 
  User, 
  AppView, 
  FilterState, 
  ChatSession,
  Event
} from './types';
import { 
  MOCK_USERS, 
  MOCK_CHATS_INITIAL, 
  MOCK_EVENTS,
  MOCK_INCOMING_LIKES,
  MOCK_CENTER_LAT,
  MOCK_CENTER_LNG
} from './constants';
import { 
  Map, 
  MessageCircle, 
  User as UserIcon, 
  RotateCcw, 
  Filter, 
  Heart, 
  X,
  Search,
  Sparkles,
  Calendar
} from 'lucide-react';

import { UserCard } from './components/UserCard';
import { Button } from './components/Button';
import { FilterModal } from './components/FilterModal';
import { MapView } from './components/MapView';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { EventList } from './components/EventList';
import { CreateEventModal } from './components/CreateEventModal';
import { EditProfileModal } from './components/EditProfileModal';
import { MatchModal } from './components/MatchModal';
import { RegistrationForm } from './components/RegistrationForm';
import { LikesList } from './components/LikesList';
import { analyzeCompatibility } from './services/geminiService';

// Helper to calculate distance in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>('register');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // Initial empty user for registration
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'me',
    name: '',
    age: 0,
    gender: 'male',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60', // Placeholder
    bio: '',
    interests: [],
    location: { lat: MOCK_CENTER_LAT, lng: MOCK_CENTER_LNG },
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(MOCK_CHATS_INITIAL);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [incomingLikes, setIncomingLikes] = useState<string[]>(MOCK_INCOMING_LIKES);
  
  const [filters, setFilters] = useState<FilterState>({
    ageRange: [18, 50],
    gender: 'all',
    interests: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [swipedUserIds, setSwipedUserIds] = useState<Set<string>>(new Set());
  
  // Profile Modal State (from Map click or Info click)
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Match Modal State
  const [matchModalUser, setMatchModalUser] = useState<User | null>(null);

  // Calculate distances and filter users
  const visibleUsers = useMemo(() => {
    return users.map(user => ({
      ...user,
      distance: getDistanceFromLatLonInKm(
        currentUser.location.lat, 
        currentUser.location.lng, 
        user.location.lat, 
        user.location.lng
      )
    })).filter(user => {
      // 1. Filter by ID (not swiped yet for Swipe View, but kept for Map)
      if (view === 'swipe' && swipedUserIds.has(user.id)) return false;
      
      // 2. Filter by Gender
      if (filters.gender !== 'all' && user.gender !== filters.gender) return false;
      
      // 3. Filter by Age
      if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) return false;
      
      // 4. Filter by Interests (Show if at least one matches, or if no filter selected)
      if (filters.interests.length > 0) {
        const hasCommon = user.interests.some(i => filters.interests.includes(i));
        if (!hasCommon) return false;
      }

      return true;
    });
  }, [users, currentUser, swipedUserIds, filters, view]);

  // Logic to process a "Like"
  const processLike = (targetUser: User) => {
    setSwipedUserIds(prev => new Set(prev).add(targetUser.id));
    
    // Check intersection of interests
    const commonInterests = currentUser.interests.filter(i => targetUser.interests.includes(i));
    
    if (commonInterests.length >= 3) {
        // MATCH!
        const existing = chatSessions.find(s => s.id === targetUser.id);
        if (!existing) {
          setChatSessions(prev => [
            { id: targetUser.id, type: 'direct', messages: [], unread: 0 },
            ...prev
          ]);
          // Trigger Match Modal
          setMatchModalUser(targetUser);
        }
        // Remove from incoming likes if they were there
        setIncomingLikes(prev => prev.filter(id => id !== targetUser.id));
    } else {
        // NO MATCH due to interest rule
        if (incomingLikes.includes(targetUser.id)) {
            setIncomingLikes(prev => prev.filter(id => id !== targetUser.id));
            alert(`К сожалению, у вас с ${targetUser.name} менее 3 общих интересов. Матч невозможен.`);
        }
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (visibleUsers.length === 0) return;
    const userToSwipe = visibleUsers[0];
    
    if (direction === 'right') {
        processLike(userToSwipe);
    } else {
        setSwipedUserIds(prev => new Set(prev).add(userToSwipe.id));
    }
  };

  const handleIncomingReject = (userId: string) => {
      setIncomingLikes(prev => prev.filter(id => id !== userId));
      setSwipedUserIds(prev => new Set(prev).add(userId));
  };

  const handleSendMessage = (text: string) => {
    if (!activeSessionId) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: activeSessionId,
      text,
      timestamp: Date.now()
    };

    setChatSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        return {
          ...session,
          messages: [...session.messages, newMessage]
        };
      }
      return session;
    }));
  };

  const openProfile = async (user: User) => {
    setInspectingUser(user);
    setAiAnalysis(null); // Reset
    const analysis = await analyzeCompatibility(currentUser, user);
    setAiAnalysis(analysis);
  };

  const handleStartChatFromModal = () => {
    if (matchModalUser) {
        setActiveSessionId(matchModalUser.id);
        setView('chat');
        setMatchModalUser(null);
    }
  };

  // --- Event Handlers ---

  const handleJoinEvent = (eventId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;

    const isAlreadyJoined = targetEvent.participantsIds.includes(currentUser.id);

    // 1. Update event participants
    setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
            if (isAlreadyJoined) {
                // Leaving logic - remove from event participants
                return {
                    ...event,
                    participantsIds: event.participantsIds.filter(id => id !== currentUser.id)
                };
            } else {
                // Joining logic
                return {
                    ...event,
                    participantsIds: [...event.participantsIds, currentUser.id]
                };
            }
        }
        return event;
    }));

    // 2. If Joining: Create or Activate Chat Session AND Navigate
    if (!isAlreadyJoined) {
        const existingSession = chatSessions.find(s => s.id === eventId);
        
        if (!existingSession) {
            // Create new event chat
            const newSession: ChatSession = {
                id: eventId,
                type: 'event',
                eventId: eventId,
                messages: [],
                unread: 0
            };
            setChatSessions(prev => [newSession, ...prev]);
        }
        
        // Navigate to Chat
        setActiveSessionId(eventId);
        setView('chat');
    }
  };

  const handleCreateEvent = (data: Partial<Event>) => {
      const newEventId = Date.now().toString();
      const newEvent: Event = {
          id: newEventId,
          title: data.title || 'Новое событие',
          description: data.description || '',
          date: data.date || new Date().toISOString(),
          locationName: data.locationName || 'Не указано',
          organizerId: currentUser.id,
          participantsIds: [currentUser.id],
          tags: data.tags || []
      };
      setEvents(prev => [newEvent, ...prev]);
      
      // Automatically create chat for created event
      setChatSessions(prev => [{
          id: newEventId,
          type: 'event',
          eventId: newEventId,
          messages: [],
          unread: 0
      }, ...prev]);

      // Automatically navigate to the new event chat
      setActiveSessionId(newEventId);
      setView('chat');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleRegistrationComplete = (user: User) => {
    setCurrentUser(user);
    setView('swipe');
  };

  // --- Render ---

  if (view === 'register') {
    return (
      <RegistrationForm 
        initialData={currentUser} 
        onComplete={handleRegistrationComplete} 
      />
    );
  }

  // Find active chat data
  const activeSession = chatSessions.find(s => s.id === activeSessionId);
  const activePartner = activeSession?.type === 'direct' ? users.find(u => u.id === activeSessionId) : undefined;
  const activeEvent = activeSession?.type === 'event' ? events.find(e => e.id === activeSessionId) : undefined;

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl">
      
      {/* Top Bar */}
      <div className="h-16 px-4 bg-white flex items-center justify-between shadow-sm z-20 shrink-0">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
          F2F
        </h1>
        {view === 'swipe' && (
          <button onClick={() => setIsFilterOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Filter size={24} />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        
        {/* VIEW: SWIPE */}
        {view === 'swipe' && (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 relative min-h-0 p-2">
              {visibleUsers.length > 0 ? (
                <UserCard 
                  user={visibleUsers[0]} 
                  currentUser={currentUser}
                  distance={visibleUsers[0].distance || 0} 
                  onInfoClick={() => openProfile(visibleUsers[0])}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow p-6">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">Никого нет рядом</h3>
                  <p className="text-gray-500 mt-2">Попробуйте изменить фильтры.</p>
                  <Button variant="outline" className="mt-6" onClick={() => setIsFilterOpen(true)}>
                    Настроить фильтры
                  </Button>
                  <Button variant="ghost" className="mt-2" onClick={() => setSwipedUserIds(new Set())}>
                    <RotateCcw size={16} className="mr-2" />
                    Начать заново
                  </Button>
                </div>
              )}
            </div>

            {visibleUsers.length > 0 && (
              <div className="h-24 shrink-0 flex justify-center items-center gap-8 pb-4">
                <Button 
                  variant="icon" 
                  className="bg-white text-red-500 shadow-lg border-2 border-transparent hover:border-red-100 hover:bg-red-50 w-[65px] h-[65px] rounded-full"
                  onClick={() => handleSwipe('left')}
                >
                  <X size={32} strokeWidth={2.5} />
                </Button>
                <Button 
                  variant="icon" 
                  className="bg-white text-green-500 shadow-lg border-2 border-transparent hover:border-green-100 hover:bg-green-50 w-[65px] h-[65px] rounded-full"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart size={32} fill="currentColor" className="text-green-500" strokeWidth={0} />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: MAP */}
        {view === 'map' && (
          <div className="w-full h-full">
            <MapView 
              users={visibleUsers} 
              currentUser={currentUser}
              onSelectUser={openProfile}
            />
          </div>
        )}

        {/* VIEW: EVENTS */}
        {view === 'events' && (
            <div className="w-full h-full">
                <EventList 
                    events={events}
                    users={[currentUser, ...users]}
                    currentUser={currentUser}
                    onJoinEvent={handleJoinEvent}
                    onCreateEventClick={() => setIsCreateEventOpen(true)}
                />
            </div>
        )}

        {/* VIEW: LIKES */}
        {view === 'likes' && (
            <div className="w-full h-full">
                <LikesList 
                    incomingLikes={incomingLikes}
                    users={users}
                    currentUser={currentUser}
                    onAccept={processLike}
                    onReject={handleIncomingReject}
                />
            </div>
        )}

        {/* VIEW: CHAT LIST */}
        {view === 'chat' && !activeSessionId && (
          <ChatList 
            sessions={chatSessions} 
            users={users} 
            events={events}
            onSelectChat={setActiveSessionId} 
          />
        )}

        {/* VIEW: ACTIVE CHAT */}
        {view === 'chat' && activeSessionId && (
          <div className="absolute inset-0 z-30 bg-white">
            <ChatWindow 
              currentUser={currentUser}
              session={activeSession}
              partner={activePartner}
              event={activeEvent}
              onBack={() => setActiveSessionId(null)}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}

        {/* VIEW: PROFILE (MY PROFILE) */}
        {view === 'profile' && (
           <div className="p-6 overflow-y-auto h-full bg-white">
             <div className="flex flex-col items-center mb-6">
                <img src={currentUser.photoUrl} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-indigo-100" alt="me" />
                <h2 className="text-2xl font-bold">{currentUser.name}, {currentUser.age}</h2>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {currentUser.interests.map(i => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{i}</span>
                  ))}
                </div>
             </div>
             
             <div className="bg-indigo-50 p-4 rounded-xl mb-6">
               <h3 className="font-semibold text-indigo-900 mb-2">О себе</h3>
               <p className="text-indigo-700">{currentUser.bio}</p>
             </div>

             <Button 
                variant="outline" 
                fullWidth 
                className="mb-2"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Редактировать профиль
              </Button>
             <Button variant="ghost" fullWidth className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setView('register')}>Выйти</Button>
           </div>
        )}
      </div>

      {/* INSPECT USER MODAL (Popup over Map/Swipe) */}
      {inspectingUser && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="relative h-64">
               <img src={inspectingUser.photoUrl} className="w-full h-full object-cover" />
               <button 
                  onClick={() => setInspectingUser(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
               >
                 <X size={20} />
               </button>
             </div>
             <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold">{inspectingUser.name}, {inspectingUser.age}</h2>
                  {inspectingUser.distance !== undefined && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ~{Math.round(inspectingUser.distance)} км
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {inspectingUser.interests.map(i => {
                      const isCommon = currentUser.interests.includes(i);
                      return (
                        <span key={i} className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                           isCommon 
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-transparent'
                        }`}>
                          {i}
                        </span>
                      );
                  })}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{inspectingUser.bio}</p>

                {/* AI Analysis Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 mb-6">
                   <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm">
                     <Sparkles size={16} />
                     <span>Мнение AI о совместимости</span>
                   </div>
                   <p className="text-sm text-indigo-900 italic">
                     {aiAnalysis || "Анализирую ваши интересы..."}
                   </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setInspectingUser(null)}
                  >
                    Закрыть
                  </Button>
                  <Button 
                    fullWidth 
                    className="bg-gradient-to-r from-indigo-600 to-pink-500 border-0"
                    onClick={() => {
                        processLike(inspectingUser);
                        setInspectingUser(null);
                    }}
                  >
                    Лайкнуть
                  </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MATCH MODAL */}
      <MatchModal 
        isOpen={!!matchModalUser}
        currentUser={currentUser}
        matchedUser={matchModalUser}
        onClose={() => setMatchModalUser(null)}
        onStartChat={handleStartChatFromModal}
      />

      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters}
        setFilters={setFilters}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSubmit={handleCreateEvent}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onUpdate={handleUpdateProfile}
      />

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 h-16 px-2 pb-1 flex items-center justify-between shrink-0 z-20 relative">
         <button 
           onClick={() => setView('swipe')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'swipe' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <Search size={22} />
           <span className="text-[10px] font-medium">Поиск</span>
         </button>
         
         <button 
           onClick={() => setView('map')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'map' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <Map size={22} />
           <span className="text-[10px] font-medium">Карта</span>
         </button>

         <button 
           onClick={() => setView('events')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'events' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <Calendar size={22} />
           <span className="text-[10px] font-medium">События</span>
         </button>

         <button 
           onClick={() => setView('likes')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'likes' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <div className="relative">
               <Heart size={22} className={view === 'likes' ? 'fill-current' : ''} />
               {incomingLikes.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
               )}
           </div>
           <span className="text-[10px] font-medium">Лайки</span>
         </button>

         <button 
           onClick={() => setView('chat')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'chat' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <div className="relative">
             <MessageCircle size={22} />
             {chatSessions.reduce((acc, s) => acc + s.unread, 0) > 0 && (
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             )}
           </div>
           <span className="text-[10px] font-medium">Чаты</span>
         </button>

         <button 
           onClick={() => setView('profile')}
           className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${view === 'profile' ? 'text-indigo-600' : 'text-gray-400'}`}
         >
           <UserIcon size={22} />
           <span className="text-[10px] font-medium">Профиль</span>
         </button>
      </div>
    </div>
  );
};

export default App;
