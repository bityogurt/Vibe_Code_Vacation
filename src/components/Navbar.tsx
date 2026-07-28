import React, { useState } from 'react';
import { 
  MapPin, 
  Car, 
  Calendar, 
  Flame, 
  BarChart3, 
  Bot, 
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
    <>
      {/* TOP COMPACT MOBILE HEADER */}
      <header className="shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 py-2 z-30">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Trip Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0">
              🇬🇷
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white text-xs sm:text-sm tracking-tight truncate">
                  Kefalonia Match
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  20-26 Sept
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0 inline" />
                Villa Louke • 5 Turiști • 2 Mașini
              </p>
            </div>
          </div>

          {/* Actions & User Selector */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenAddModal}
              title="Adaugă card nou"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition flex items-center gap-1 text-[10px] font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Card</span>
            </button>

            <button
              onClick={handleCopyRoomLink}
              title="Copiază link cameră"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={onOpenUserModal}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${currentUser.avatarColor}`} />
              <span className="max-w-[55px] truncate text-[11px] font-semibold">{currentUser.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

        </div>
      </header>

      {/* FIXED BOTTOM MOBILE NAVIGATION TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-2 max-w-md mx-auto">
        <div className="grid grid-cols-5 gap-1 text-center">
          
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'swipe'
                ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className={`w-5 h-5 ${activeTab === 'swipe' ? 'text-rose-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">Swipe</span>
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'consensus'
                ? 'bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'consensus' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">Consens</span>
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition relative ${
              activeTab === 'itinerary'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Calendar className={`w-5 h-5 ${activeTab === 'itinerary' ? 'text-emerald-400' : 'text-slate-400'}`} />
              {lockedCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.1 bg-emerald-400 text-slate-950 font-black text-[9px] rounded-full">
                  {lockedCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">Itinerar</span>
          </button>

          <button
            onClick={() => setActiveTab('cars')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'cars'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className={`w-5 h-5 ${activeTab === 'cars' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">Mașini</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
              activeTab === 'ai'
                ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className={`w-5 h-5 ${activeTab === 'ai' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight leading-none">AI</span>
          </button>

        </div>
      </nav>
    </>
  );
};
