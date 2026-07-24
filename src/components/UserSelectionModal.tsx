import React, { useState } from 'react';
import { Users, X, Check, Plus, Key } from 'lucide-react';
import { UserProfile, RoomState } from '../types';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomState: RoomState;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onSwitchRoom: (newRoomId: string) => void;
}

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

  if (!isOpen) return null;

  const handleCreateCustomMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNameInput.trim()) return;

    const colors = ['bg-rose-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newMember: UserProfile = {
      id: `m-custom-${Date.now()}`,
      name: customNameInput.trim(),
      avatarColor: randomColor,
      assignedCar: 'Car 1'
    };

    onSelectUser(newMember);
    setCustomNameInput('');
    onClose();
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-lg">Alege Profilul Tău din Grup</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Group Members */}
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
            Prieteni în grupul {roomState.roomId}
          </label>

          <div className="grid grid-cols-1 gap-2">
            {roomState.members.map(member => {
              const isSelected = member.id === currentUser.id;

              return (
                <button
                  key={member.id}
                  onClick={() => {
                    onSelectUser(member);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm ring-2 ring-slate-900 shadow-sm`}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{member.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {member.assignedCar || 'Car 1'} • Pregătit de vot
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add custom member name */}
        <form onSubmit={handleCreateCustomMember} className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs text-slate-400 font-semibold block">Adaugă Numele Tău (Dacă nu ești în listă)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ex: Mihai"
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
            >
              Intră
            </button>
          </div>
        </form>

        {/* Switch Room Code */}
        <form onSubmit={handleRoomSwitchSubmit} className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs text-slate-400 font-semibold block flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Schimbă sau Creează Altă Cameră de Grup
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ex: KEFALONIA-FUN"
              value={newRoomInput}
              onChange={(e) => setNewRoomInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs uppercase rounded-xl p-2.5 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700"
            >
              Accesează
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
