import React from 'react';
import { UserProfile } from '../types';
import { Compass, UserCheck, Sparkles, MapPin, Car } from 'lucide-react';

interface WelcomeScreenProps {
  members: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ members, onSelectUser }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-rose-500 overflow-y-auto">
      {/* Background Subtle Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl my-auto">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-black shadow-lg mb-1">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kefalonia Trip Matcher</h1>
          <p className="text-xs text-slate-400">
            20 - 26 Iulie 2026 • Villa Louke • 5 Turiști & 2 Mașini
          </p>
        </div>

        {/* User Selection Prompt */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Cine ești din echipă?
            </span>
            <span className="text-[10px] text-slate-500 font-mono">5 Profiluri</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectUser(member)}
                className="group relative w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/80 transition-all text-left flex items-center justify-between shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${member.avatarColor} text-white font-black text-base flex items-center justify-center shadow-md ring-2 ring-slate-900 group-hover:scale-105 transition-transform`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3 text-indigo-400" />
                        {member.assignedCar || 'Car 1'}
                      </span>
                      <span>•</span>
                      <span>Membru Villa Louke</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500 group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                  Intră <Sparkles className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Voturile tale de swipe sunt salvate în timp real și puse în consens cu ceilalți 4 prieteni.
          </p>
        </div>

      </div>
    </div>
  );
};
