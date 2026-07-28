import React from 'react';
import { UserProfile } from '../types';
import { Compass, UserCheck, Sparkles, Car } from 'lucide-react';

interface WelcomeScreenProps {
  members: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ members, onSelectUser }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto">
        
        {/* Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-black shadow-md mb-1">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Kefalonia Match</h1>
          <p className="text-xs text-slate-400">
            20 - 26 Septembrie 2026 • Villa Louke
          </p>
        </div>

        {/* Member list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              Cine ești din grup?
            </span>
            <span className="text-[10px] text-slate-500 font-mono">5 Turiști</span>
          </div>

          <div className="space-y-2">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectUser(member)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition text-left flex items-center justify-between shadow-sm active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${member.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Car className="w-3 h-3 text-sky-400" />
                      {member.assignedCar || 'Car 1'}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                  Intră <Sparkles className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
