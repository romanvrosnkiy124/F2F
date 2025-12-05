
import React, { useEffect, useRef } from 'react';
import { User } from '../types';

// Declare Yandex Maps types globally for TS
declare const ymaps: any;

interface MapViewProps {
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const MapView: React.FC<MapViewProps> = ({ users, currentUser, onSelectUser }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Helper to init map
    const initMap = () => {
      if (mapInstanceRef.current) return; // Prevent double init

      // Create Map
      const map = new ymaps.Map(mapContainerRef.current, {
        center: [currentUser.location.lat, currentUser.location.lng],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      }, {
        searchControlProvider: 'yandex#search'
      });

      mapInstanceRef.current = map;
      updateMarkers(map);
    };

    // Check if Yandex API is loaded
    if (typeof ymaps !== 'undefined') {
      ymaps.ready(initMap);
    } else {
      console.error('Yandex Maps API not loaded');
    }

    // Cleanup
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
        }
    };
  }, []); // Init once

  // Update markers when users or currentUser changes
  useEffect(() => {
    if (mapInstanceRef.current && typeof ymaps !== 'undefined') {
      ymaps.ready(() => {
          updateMarkers(mapInstanceRef.current);
      });
    }
  }, [users, currentUser]);

  const updateMarkers = (map: any) => {
    map.geoObjects.removeAll();

    // 1. Create Layout for Current User (Pulsating Dot)
    const MeLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4">
            <span class="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping"></span>
            <span class="relative inline-flex rounded-full h-8 w-8 bg-indigo-600 border-2 border-white items-center justify-center shadow-lg overflow-hidden">
                <img src="$[properties.photoUrl]" class="w-full h-full object-cover" />
            </span>
        </div>`
    );

    const mePlacemark = new ymaps.Placemark(
        [currentUser.location.lat, currentUser.location.lng],
        {
            photoUrl: currentUser.photoUrl,
            hintContent: 'Это вы'
        },
        {
            iconLayout: MeLayout,
            iconShape: {
                type: 'Circle',
                coordinates: [0, 0],
                radius: 16
            }
        }
    );
    map.geoObjects.add(mePlacemark);

    // 2. Create Layout for Other Users (Pins)
    // We can use a factory that takes properties to style the border dynamically, 
    // but string templates in YMaps access $[properties.x] easily.
    const UserLayout = ymaps.templateLayoutFactory.createClass(
        `<div class="relative w-12 h-12 -ml-6 -mt-12 transition-transform duration-200 transform hover:scale-110 cursor-pointer group">
            <!-- Pin Shape -->
            <div class="absolute inset-0 bg-white rounded-full border-[3px] $[properties.borderColor] shadow-lg ring-2 $[properties.ringColor] overflow-hidden">
                <img src="$[properties.photoUrl]" class="w-full h-full object-cover" />
            </div>
            <!-- Pointy bottom -->
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b $[properties.borderColor]"></div>
            
            <!-- Tooltip (Simulated via hover class) -->
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
               $[properties.name], $[properties.age]
            </div>
        </div>`
    );

    users.forEach(user => {
        // Calculate style props
        const commonInterests = user.interests.filter(i => currentUser.interests.includes(i));
        const borderColor = commonInterests.length > 2 ? 'border-pink-500' : commonInterests.length > 0 ? 'border-orange-500' : 'border-white';
        const ringColor = commonInterests.length > 2 ? 'ring-pink-300' : 'ring-transparent';

        const placemark = new ymaps.Placemark(
            [user.location.lat, user.location.lng],
            {
                // Properties passed to layout
                photoUrl: user.photoUrl,
                name: user.name,
                age: user.age,
                borderColor: borderColor, // e.g. "border-pink-500" - YMaps templates put this string directly into class
                ringColor: ringColor,
                userId: user.id
            },
            {
                iconLayout: UserLayout,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [[-24, -48], [24, 0]]
                }
            }
        );

        // Add click listener
        placemark.events.add('click', () => {
            onSelectUser(user);
        });

        map.geoObjects.add(placemark);
    });
  };

  return (
    <div className="w-full h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-gray-200" />
        
        {/* Legend */}
        <div className="absolute bottom-10 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 text-xs text-gray-600 z-10 pointer-events-none">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                    <span>Топ совпадение (>2 интересов)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span>Есть общие интересы</span>
                </div>
            </div>
        </div>
    </div>
  );
};
