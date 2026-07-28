import React, { useState } from 'react';
import { Users, X, Check, Key, ShieldCheck, Lock } from 'lucide-react';
import { UserProfile, RoomState } from '../types';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onSwitchRoom: (newRoomId: string) => void;
}

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

export const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  isOpen,
  onClose,
  roomState,
  currentUser,
  onSelectUser,
  onSwitchRoom
}) => {
  const [newRoomInput, setNewRoomInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [authenticatingMember, setAuthenticatingMember] = useState<UserProfile | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleMemberClick = (member: UserProfile) => {
    if (member.id === currentUser.id) {
      onClose();
      return;
    }
    setAuthenticatingMember(member);
    setPasswordInput('');
    setErrorMessage('');
  };

  const handleConfirmLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatingMember) return;

    const memberNameKey = authenticatingMember.name.trim();
    const isCodin = memberNameKey.toLowerCase() === 'codin';

    const expectedPassword = DEFAULT_PASSWORDS[memberNameKey] || DEFAULT_PASSWORDS[memberNameKey.toLowerCase()] || '1234';

    if (passwordInput.trim() === expectedPassword) {
      onSelectUser({
        ...authenticatingMember,
        role: isCodin ? 'admin' : 'user',
        isAdmin: isCodin
      });
      setAuthenticatingMember(null);
      setPasswordInput('');
      onClose();
    } else {
      setErrorMessage(isCodin ? '❌ Parolă incorectă pentru Admin Codin!' : '❌ Parolă incorectă!');
    }
  };

  const handleCreateCustomMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameInput.trim()) return;

    const nameTrimmed = customNameInput.trim();
    const isCodin = nameTrimmed.toLowerCase() === 'codin';

    const colors = ['bg-sky-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newMember: UserProfile = {
      id: `m-custom-${Date.now()}`,
      name: nameTrimmed,
      avatarColor: randomColor,
      assignedCar: 'Car 1',
      role: isCodin ? 'admin' : 'user',
      isAdmin: isCodin
    };

    setAuthenticatingMember(newMember);
    setCustomNameInput('');
  };

  const handleRoomSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomInput.trim()) return;
    onSwitchRoom(newRoomInput.trim().toUpperCase());
    setNewRoomInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Schimbă Utilizatorul</h3>
          </div>
          <button 
            onClick={() => {
              setAuthenticatingMember(null);
              onClose();
            }} 
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Password Prompt Step */}
        {authenticatingMember ? (
          <form onSubmit={handleConfirmLogin} className="space-y-3 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${authenticatingMember.avatarColor} text-white font-black flex items-center justify-center text-sm shadow relative shrink-0`}>
                {authenticatingMember.name.charAt(0)}
                {authenticatingMember.name.toLowerCase() === 'codin' && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
              </div>
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-1">
                  <span>Intră în contul {authenticatingMember.name}</span>
                  {authenticatingMember.name.toLowerCase() === 'codin' && (
                    <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/20 px-1 py-0.2 rounded border border-cyan-400/30">
                      ADMIN
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400">Introdu parola pentru autentificare</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">Parolă:</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Introdu parola..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-sky-500"
              />
              {errorMessage && <p className="text-xs text-rose-400 font-bold">{errorMessage}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAuthenticatingMember(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirmă</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Existing Group Members */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Membri în grup ({roomState.roomId})
              </label>

              <div className="space-y-1.5">
                {roomState.members.map(member => {
                  const isSelected = member.id === currentUser.id;
                  const isCodin = member.name.toLowerCase() === 'codin';

                  return (
                    <button
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between w-full ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow'
                          : isCodin
                            ? 'bg-cyan-950/30 border-cyan-500/40 text-white hover:bg-cyan-900/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-xs relative`}>
                          {member.name.charAt(0)}
                          {isCodin && <span className="absolute -top-1 -right-1 text-[10px]">👑</span>}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1">
                            <span>{member.name}</span>
                            {isCodin && (
                              <span className="text-[9px] font-black text-cyan-300 bg-cyan-500/20 px-1 py-0.2 rounded border border-cyan-400/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {member.assignedCar || 'Car 1'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isSelected && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add custom member name */}
            <form onSubmit={handleCreateCustomMember} className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] text-slate-400 font-bold block">Adaugă alt nume în grup</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Alexandru sau codin"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition"
                >
                  Continuă
                </button>
              </div>
            </form>

            {/* Switch Room Code */}
            <form onSubmit={handleRoomSwitchSubmit} className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Schimbă Codul Camerei
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: KEFALONIA-2026"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs uppercase rounded-xl p-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition border border-slate-700"
                >
                  Intră
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
