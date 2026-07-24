import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Car, 
  Calendar, 
  Flame, 
  BarChart3, 
  Bot, 
  Users, 
  PlusCircle, 
  Copy, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { UserProfile, RoomState, DayItinerary } from '../types';

interface NavbarProps {
  activeTab: 'swipe' | 'consensus' | 'itinerary' | 'cars' | 'ai';
  setActiveTab: (tab: 'swipe' | 'consensus' | 'itinerary' | 'cars' | 'ai') => void;
  currentRoom: RoomState;
  currentUser: UserProfile;
  onOpenUserModal: () => void;
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRoom,
  currentUser,
  onOpenUserModal,
  onOpenAddModal
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomLink = () => {
    const url = `${window.location.origin}?room=${currentRoom.roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate total locked activities across days
  const lockedCount = (Object.values(currentRoom.itineraries || {}) as DayItinerary[]).reduce(
    (acc, day) => acc + (day.activityIds?.length || 0), 0
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Room Info */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 font-black text-xl">
              🇬🇷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-base sm:text-lg tracking-tight leading-none">
                  Kefalonia Match
                </h1>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  20-26 Iulie
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-400 inline" />
                Villa Louke • 5 Turiști • 2 Mașini
              </p>
            </div>
          </div>

          {/* User Switcher Pill & Room Code (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${currentUser.avatarColor}`} />
              <span className="max-w-[70px] truncate">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <nav className="flex items-center justify-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'swipe'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            Swipe Carduri
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap relative ${
              activeTab === 'consensus'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-300" />
            Consens Grup
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'itinerary'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-300" />
            Itinerar Zile
            {lockedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-extrabold text-[10px] rounded-full">
                {lockedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'cars'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4 text-amber-300" />
            2 Mașini & Buget
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300" />
            Kefalonia AI
          </button>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Add custom activity button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Adaugă Card
          </button>

          {/* Copy Room Link Button */}
          <button
            onClick={handleCopyRoomLink}
            title="Copiază link-ul camerei pentru prieteni"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copiat!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Cod: <strong className="text-white">{currentRoom.roomId}</strong></span>
              </>
            )}
          </button>

          {/* Desktop User profile selector */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:bg-slate-700 text-xs font-medium transition shadow-sm"
          >
            <div className={`w-3 h-3 rounded-full ${currentUser.avatarColor} ring-2 ring-slate-900`} />
            <span className="font-semibold text-slate-200">{currentUser.name}</span>
            <Users className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </div>

      </div>
    </header>
  );
};
