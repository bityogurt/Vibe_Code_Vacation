import React from 'react';
import { 
  Car, 
  Calendar, 
  Flame, 
  BarChart3 
} from 'lucide-react';
import { UserProfile, RoomState, DayItinerary } from '../types';

interface NavbarProps {
  activeTab: 'swipe' | 'consensus' | 'itinerary' | 'cars';
  setActiveTab: (tab: 'swipe' | 'consensus' | 'itinerary' | 'cars') => void;
  currentRoom: RoomState;
  currentUser: UserProfile;
  onOpenUserModal: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRoom
}) => {
  // Calculate total locked activities across days
  const lockedCount = (Object.values(currentRoom.itineraries || {}) as DayItinerary[]).reduce(
    (acc, day) => acc + (day.activityIds?.length || 0), 0
  );

  const tabs: {
    id: 'swipe' | 'consensus' | 'itinerary' | 'cars';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeColor: string;
    glowColor: string;
    badge?: number;
  }[] = [
    {
      id: 'swipe',
      label: 'Swipe',
      icon: Flame,
      activeColor: 'text-rose-400',
      glowColor: 'from-rose-500/30 to-rose-500/5 border-rose-400/40 shadow-rose-500/20'
    },
    {
      id: 'consensus',
      label: 'Consens',
      icon: BarChart3,
      activeColor: 'text-indigo-400',
      glowColor: 'from-indigo-500/30 to-indigo-500/5 border-indigo-400/40 shadow-indigo-500/20'
    },
    {
      id: 'itinerary',
      label: 'Itinerar',
      icon: Calendar,
      activeColor: 'text-emerald-400',
      glowColor: 'from-emerald-500/30 to-emerald-500/5 border-emerald-400/40 shadow-emerald-500/20',
      badge: lockedCount
    },
    {
      id: 'cars',
      label: 'Mașini',
      icon: Car,
      activeColor: 'text-amber-400',
      glowColor: 'from-amber-500/30 to-amber-500/5 border-amber-400/40 shadow-amber-500/20'
    }
  ];

  return (
    <>
      {/* FLOATING LIQUID GLASS BOTTOM EQUALLY SPLIT TAB BAR */}
      <nav className="fixed bottom-2 left-2 right-2 z-40 max-w-md mx-auto">
        <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-3xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] grid grid-cols-4 gap-1 text-center w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl sm:rounded-2xl transition-all duration-300 relative group active:scale-95 ${
                  isActive
                    ? `bg-gradient-to-b ${tab.glowColor} border text-white shadow-lg backdrop-blur-xl`
                    : 'bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Top Liquid Glow Dot */}
                {isActive && (
                  <span className="absolute -top-0.5 w-5 h-1 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                )}

                <div className="relative">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive ? `${tab.activeColor} scale-110` : 'text-slate-400 group-hover:scale-105'}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-black text-[9px] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-emerald-200">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] sm:text-[11px] mt-1 font-bold tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

