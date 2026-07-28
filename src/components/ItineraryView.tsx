import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Trash2, 
  Sparkles, 
  Share2, 
  Check, 
  Plus,
  Camera,
  Edit3,
  Compass,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomState, Activity, DayItinerary, UserProfile } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface ItineraryViewProps {
  roomState: RoomState;
  currentUser: UserProfile;
  onUnlockDay: (dayNumber: number) => void;
  onLockActivitiesToDay: (dayNumber: number, activityIds: string[]) => void;
  onUpdateDaySchedule?: (dayNumber: number, timeSlots?: Record<string, string>, notes?: string) => void;
  onSwitchToConsensus: () => void;
  onOpenEditImage?: (activity: Activity) => void;
}

const TIME_PRESETS = [
  '09:30 - Dimineață',
  '12:30 - Prânz',
  '16:00 - După-Amiază',
  '18:30 - Apus',
  '20:30 - Seară'
];

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  roomState,
  currentUser,
  onUnlockDay,
  onLockActivitiesToDay,
  onUpdateDaySchedule,
  onSwitchToConsensus,
  onOpenEditImage
}) => {
  const isAdmin = currentUser?.isAdmin || currentUser?.name?.toLowerCase() === 'codin';
  const [activeDayNum, setActiveDayNum] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [editingTimeSlotActivityId, setEditingTimeSlotActivityId] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [dayNoteText, setDayNoteText] = useState<string>('');

  // Map of activity objects by ID
  const activityMap = useMemo(() => {
    const map: Record<string, Activity> = {};
    (roomState.activities || []).forEach(act => {
      map[act.id] = act;
    });
    return map;
  }, [roomState.activities]);

  const currentDayData = roomState.itineraries[activeDayNum] || TRIP_DAYS[activeDayNum - 1];
  const lockedActivitiesForDay = (currentDayData.activityIds || [])
    .map(id => activityMap[id])
    .filter(Boolean);

  const dayCostPerPerson = lockedActivitiesForDay.reduce((acc, act) => acc + act.costPerPerson, 0);

  // Auto-fill top voted
  const handleAutoFillTopVoted = () => {
    if (!isAdmin) {
      alert('🔒 Doar Admin Codin are permisiunea de a adăuga/bloca automat activități în itinerar!');
      return;
    }
    const lockedSet = new Set<string>();
    (Object.values(roomState.itineraries || {}) as DayItinerary[]).forEach(day => {
      (day.activityIds || []).forEach(id => lockedSet.add(id));
    });

    const unassigned = roomState.activities.filter(act => !lockedSet.has(act.id));

    const sorted = [...unassigned].sort((a, b) => {
      let likesA = 0;
      let likesB = 0;

      roomState.members.forEach(m => {
        if (roomState.votes[`${m.id}_${a.id}`]?.vote === 'like' || roomState.votes[`${m.id}_${a.id}`]?.vote === 'superlike') likesA++;
        if (roomState.votes[`${m.id}_${b.id}`]?.vote === 'like' || roomState.votes[`${m.id}_${b.id}`]?.vote === 'superlike') likesB++;
      });

      return likesB - likesA;
    });

    const topToPick = sorted.slice(0, 3).map(a => a.id);
    if (topToPick.length === 0) {
      alert('Nu mai sunt activități neasignate!');
      return;
    }

    onLockActivitiesToDay(activeDayNum, topToPick);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Smart Auto-Order by Best Time of Day
  const handleSmartAutoOrder = () => {
    if (!isAdmin) {
      alert('🔒 Doar Admin Codin are permisiunea de a optimiza/reordona itinerarul!');
      return;
    }
    if (lockedActivitiesForDay.length <= 1) return;

    const timeOrderPriority: Record<string, number> = {
      'Morning': 1,
      'Lunchtime': 2,
      'Anytime': 3,
      'Afternoon': 4,
      'Late Afternoon': 5,
      'Sunset': 6,
      'Evening': 7
    };

    const reordered = [...lockedActivitiesForDay].sort((a, b) => {
      const pA = timeOrderPriority[a.bestTimeOfDay] || 3;
      const pB = timeOrderPriority[b.bestTimeOfDay] || 3;
      return pA - pB;
    });

    const newActivityIds = reordered.map(a => a.id);
    
    // Assign default smart time slots
    const newTimeSlots: Record<string, string> = { ...(currentDayData.timeSlots || {}) };
    reordered.forEach((act, idx) => {
      if (idx === 0) newTimeSlots[act.id] = '09:30 - Dimineață';
      else if (idx === 1) newTimeSlots[act.id] = '13:00 - Prânz';
      else if (idx === 2) newTimeSlots[act.id] = '17:00 - Dup-Amiază / Apus';
      else newTimeSlots[act.id] = '20:30 - Seară';
    });

    onLockActivitiesToDay(activeDayNum, newActivityIds);
    if (onUpdateDaySchedule) {
      onUpdateDaySchedule(activeDayNum, newTimeSlots, currentDayData.notes);
    }

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
  };

  const handleSetTimeSlot = (activityId: string, slotLabel: string) => {
    const updatedTimeSlots = {
      ...(currentDayData.timeSlots || {}),
      [activityId]: slotLabel
    };
    if (onUpdateDaySchedule) {
      onUpdateDaySchedule(activeDayNum, updatedTimeSlots, currentDayData.notes);
    }
    setEditingTimeSlotActivityId(null);
  };

  const handleSaveDayNote = () => {
    if (onUpdateDaySchedule) {
      onUpdateDaySchedule(activeDayNum, currentDayData.timeSlots, dayNoteText);
    }
    setIsEditingNotes(false);
  };

  const handleRemoveActivityFromDay = (actIdToRemove: string) => {
    if (!isAdmin) {
      alert('🔒 Doar Admin Codin are permisiunea de a șterge activități din itinerar!');
      return;
    }
    const remaining = (currentDayData.activityIds || []).filter(id => id !== actIdToRemove);
    onLockActivitiesToDay(activeDayNum, remaining);
  };

  const handleCopyWhatsAppItinerary = () => {
    let text = `🇬🇷 *ITINERAR KEFALONIA (20-26 SEPTEMBRIE 2026)*\n\n`;

    TRIP_DAYS.forEach(day => {
      const dayItin = roomState.itineraries[day.dayNumber] || day;
      const acts = (dayItin?.activityIds || []).map(id => activityMap[id]).filter(Boolean);

      text += `📅 *${day.dayName}* (${day.theme})\n`;
      if (dayItin.notes) {
        text += `  📝 Note: ${dayItin.notes}\n`;
      }
      if (acts.length > 0) {
        acts.forEach((act, idx) => {
          const time = dayItin.timeSlots?.[act.id] || (idx === 0 ? 'Dimineața' : idx === 1 ? 'Prânz' : 'Seara');
          text += `  ⏰ ${time}: *${act.title}* (${act.region} • ~${act.costPerPerson}€)\n`;
        });
      } else {
        text += `  *(În curs de votare)*\n`;
      }
      text += `\n`;
    });

    text += `🚘 *Echipă:* Stefan, Robi, Raul, Codin, Bolovan (5 turiști • 2 mașini • Villa Louke)`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="w-full space-y-4 pb-6">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Itinerar 20-26 Septembrie</h2>
              <p className="text-[11px] text-slate-400">Villa Louke • 5 Turiști • 2 Mașini</p>
            </div>
          </div>

          <button
            onClick={handleCopyWhatsAppItinerary}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0 active:scale-95"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiat!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </>
            )}
          </button>
        </div>

        {/* Horizontal Days Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {TRIP_DAYS.map(day => {
            const count = roomState.itineraries[day.dayNumber]?.activityIds?.length || 0;
            const isActive = activeDayNum === day.dayNumber;

            return (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setActiveDayNum(day.dayNumber);
                  setEditingTimeSlotActivityId(null);
                  setIsEditingNotes(false);
                }}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 font-medium hover:border-slate-700'
                }`}
              >
                <span className="text-xs">Ziua {day.dayNumber}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-sky-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE DAY DETAILS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-lg">
        
        {/* Title & Theme */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
              Ziua {currentDayData.dayNumber} • {currentDayData.dayName}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {currentDayData.theme}
            </h3>
            
            {/* Day Note / Observații */}
            {isEditingNotes ? (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={dayNoteText}
                  onChange={(e) => setDayNoteText(e.target.value)}
                  placeholder="Observație zi (ex. Plecăm la 9:00, ne oprim la supermarket)..."
                  className="bg-slate-950 border border-sky-500/50 text-white text-xs rounded-xl px-3 py-1.5 flex-1 focus:outline-none"
                />
                <button
                  onClick={handleSaveDayNote}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                >
                  Salvează
                </button>
              </div>
            ) : (
              <p 
                onClick={() => {
                  setDayNoteText(currentDayData.notes || '');
                  setIsEditingNotes(true);
                }}
                className="text-xs text-slate-400 mt-1 cursor-pointer hover:text-sky-300 transition flex items-center gap-1 group"
                title="Apasă pentru a edita notele zilei"
              >
                <span>💡 {currentDayData.notes || 'Apasă pentru a adăuga o notă/observație pentru grup...'}</span>
                <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition" />
              </p>
            )}
          </div>

          <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Buget zilnic</span>
            <span className="text-xs font-black text-amber-400">~{dayCostPerPerson}€ / pers</span>
            <span className="text-[9px] text-slate-500 block">Total 5 pers: ~{dayCostPerPerson * 5}€</span>
          </div>
        </div>

        {/* TIMELINE ACTIVITIES */}
        {lockedActivitiesForDay.length > 0 ? (
          <div className="space-y-3">
            
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Program Orar & Timeline Ziua {activeDayNum}
              </h4>

              {lockedActivitiesForDay.length > 1 && (
                <button
                  onClick={handleSmartAutoOrder}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                  title="Ordonează automat după momentul optim (Dimineață -> Prânz -> Apus)"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Optimizare Orară</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {lockedActivitiesForDay.map((activity, index) => {
                const currentSlotLabel = currentDayData.timeSlots?.[activity.id] || 
                  (index === 0 ? '09:30 - Dimineață' : index === 1 ? '13:00 - Prânz' : index === 2 ? '17:00 - Dup-Amiază' : '20:30 - Seară');

                const isEditingThisSlot = editingTimeSlotActivityId === activity.id;

                return (
                  <div key={activity.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-3 space-y-2 shadow-sm">
                    
                    <div className="flex items-start justify-between gap-3">
                      {/* Image Preview */}
                      <div 
                        className="relative shrink-0 group cursor-pointer"
                        onClick={() => onOpenEditImage && onOpenEditImage(activity)}
                        title="Schimbă Imaginea"
                      >
                        <img 
                          src={activity.imageUrl} 
                          alt={activity.title} 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-800 group-hover:opacity-80 transition"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition">
                          <Camera className="w-4 h-4 text-sky-400" />
                        </div>
                      </div>

                      {/* Info & Content */}
                      <div className="flex-1 min-w-0">
                        
                        {/* Time Slot Tag */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTimeSlotActivityId(isEditingThisSlot ? null : activity.id);
                              setCustomTimeInput(currentSlotLabel);
                            }}
                            className="text-[10px] font-bold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/20 transition flex items-center gap-1"
                            title="Modifică ora"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{currentSlotLabel}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          <span className="text-[10px] text-slate-500">
                            ({activity.estimatedDuration})
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-xs mt-1.5 truncate flex items-center justify-between">
                          <span>{activity.title}</span>
                        </h5>

                        <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-slate-300 font-medium">{activity.region}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-medium">📍 {activity.distanceFromVillaLouke}</span>
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          🚗 Parcare 2 mașini: <span className="text-slate-300">{activity.carLogisticsNote}</span>
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveActivityFromDay(activity.id)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition shrink-0"
                        title="Şterge din această zi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Time Slot Quick Selector Panel */}
                    {isEditingThisSlot && (
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-sky-500/30 space-y-2 animate-in fade-in duration-150">
                        <span className="text-[10px] font-bold text-sky-300 block">
                          Alege sau scrie un orar personalizat:
                        </span>
                        
                        <div className="flex flex-wrap gap-1">
                          {TIME_PRESETS.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleSetTimeSlot(activity.id, preset)}
                              className="px-2 py-1 bg-slate-950 hover:bg-sky-500 hover:text-slate-950 text-[10px] font-bold text-slate-300 rounded-lg border border-slate-800 transition"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={customTimeInput}
                            onChange={(e) => setCustomTimeInput(e.target.value)}
                            placeholder="ex. 15:45 - Apus romantic"
                            className="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 flex-1 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={() => handleSetTimeSlot(activity.id, customTimeInput)}
                            className="px-3 py-1 bg-sky-500 text-slate-950 font-bold text-xs rounded-lg shadow"
                          >
                            Setează
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Clear button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (!isAdmin) {
                    alert('🔒 Doar Admin Codin poate goli itinerarul unei zile!');
                    return;
                  }
                  onUnlockDay(activeDayNum);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition flex items-center gap-1"
                title={isAdmin ? `Golește planul pentru Ziua ${activeDayNum}` : 'Doar Admin (Codin) poate goli planul'}
              >
                {!isAdmin && <span className="text-[10px]">🔒</span>}
                <span>Golește planul pentru Ziua {activeDayNum}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-950/40">
            <p className="text-xs font-semibold text-slate-300">Ziua {activeDayNum} nu are activități adăugate încă.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={handleAutoFillTopVoted}
                className="w-full sm:w-auto px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Adaugă Automat Top 3 Cele Mai Votate
              </button>

              <button
                onClick={onSwitchToConsensus}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
              >
                Alege din Consens
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
