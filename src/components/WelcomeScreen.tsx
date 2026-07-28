import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Compass, UserCheck, Sparkles, Car, Lock, Key, ArrowLeft, ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  members: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

// Passwords mapping
const DEFAULT_PASSWORDS: Record<string, string> = {
  codin: 'Pretornic2',
  Codin: 'Pretornic2',
  stefan: 'stefan123',
  Stefan: 'stefan123',
  robi: 'robi123',
  Robi: 'robi123',
  raul: 'raul123',
  Raul: 'raul123',
  bolovan: 'bolovan123',
  Bolovan: 'bolovan123'
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ members, onSelectUser }) => {
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleAttemptLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const memberNameKey = selectedMember.name.trim();
    const isCodin = memberNameKey.toLowerCase() === 'codin';

    // Password lookup
    const expectedPassword = DEFAULT_PASSWORDS[memberNameKey] || DEFAULT_PASSWORDS[memberNameKey.toLowerCase()] || '1234';

    if (passwordInput.trim() === expectedPassword) {
      setErrorMessage('');
      onSelectUser({
        ...selectedMember,
        role: isCodin ? 'admin' : 'user',
        isAdmin: isCodin
      });
    } else {
      setErrorMessage(isCodin ? '❌ Parolă incorectă pentru Admin Codin!' : '❌ Parolă incorectă!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto">
        
        {/* Title Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-black shadow-md mb-1">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Kefalonia Match</h1>
          <p className="text-xs text-slate-400">
            20 - 26 Septembrie 2026 • Villa Louke
          </p>
        </div>

        {/* Member Selection View OR Password Prompt View */}
        {!selectedMember ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Autentificare Profil
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5 Turiști</span>
            </div>

            <div className="space-y-2">
              {members.map((member) => {
                const isCodin = member.name.toLowerCase() === 'codin';

                return (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setPasswordInput('');
                      setErrorMessage('');
                    }}
                    className={`w-full p-3 rounded-2xl border transition text-left flex items-center justify-between shadow-sm active:scale-95 ${
                      isCodin 
                        ? 'bg-gradient-to-r from-sky-950/60 to-cyan-950/60 border-cyan-500/50 hover:border-cyan-400 ring-1 ring-cyan-500/20' 
                        : 'bg-slate-950 border-slate-800 hover:border-sky-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${member.avatarColor} text-white font-black text-sm flex items-center justify-center shadow-md relative`}>
                        {member.name.charAt(0)}
                        {isCodin && (
                          <span className="absolute -top-1 -right-1 text-xs">👑</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isCodin && (
                            <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-400/30">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Car className="w-3 h-3 text-sky-400" />
                          {member.assignedCar || 'Car 1'}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Alege <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* PASSWORD ENTER FORM */
          <form onSubmit={handleAttemptLogin} className="space-y-4 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={() => {
                setSelectedMember(null);
                setErrorMessage('');
              }}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Înapoi la lista de utilizatori
            </button>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${selectedMember.avatarColor} text-white font-black text-base flex items-center justify-center shadow-md relative shrink-0`}>
                {selectedMember.name.charAt(0)}
                {selectedMember.name.toLowerCase() === 'codin' && (
                  <span className="absolute -top-1 -right-1 text-xs">👑</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>{selectedMember.name}</span>
                  {selectedMember.name.toLowerCase() === 'codin' && (
                    <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-400/30">
                      ADMIN CROWN
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedMember.name.toLowerCase() === 'codin' 
                    ? 'Cont Administrator cu Privilegii Depline' 
                    : 'Membru Echipă Kefalonia 2026'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-sky-400" />
                  Introdu Parola:
                </span>
                {selectedMember.name.toLowerCase() === 'codin' && (
                  <span className="text-[10px] font-mono text-cyan-400">Pretornic2</span>
                )}
              </label>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder={selectedMember.name.toLowerCase() === 'codin' ? 'Parola ta (Pretornic2)...' : 'Parola ta...'}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm rounded-xl p-3 focus:outline-none focus:border-sky-500 transition"
              />

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-400 mt-1">{errorMessage}</p>
              )}

              {selectedMember.name.toLowerCase() === 'codin' && (
                <p className="text-[10px] text-slate-400 pt-1">
                  💡 Ca Admin (Codin), doar tu poți șterge sau reseta activități din itinerar și bloca definitiv zilele!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Autentificare</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
