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
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomState, Activity, DayItinerary } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface ItineraryViewProps {
  roomState: RoomState;
  onUnlockDay: (dayNumber: number) => void;
  onLockActivitiesToDay: (dayNumber: number, activityIds: string[]) => void;
  onSwitchToConsensus: () => void;
  onOpenEditImage?: (activity: Activity) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  roomState,
  onUnlockDay,
  onLockActivitiesToDay,
  onSwitchToConsensus,
  onOpenEditImage
}) => {
  const [activeDayNum, setActiveDayNum] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<boolean>(false);

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

  const handleAutoFillTopVoted = () => {
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

  const handleRemoveActivityFromDay = (actIdToRemove: string) => {
    const remaining = (currentDayData.activityIds || []).filter(id => id !== actIdToRemove);
    onLockActivitiesToDay(activeDayNum, remaining);
  };

  const handleCopyWhatsAppItinerary = () => {
    let text = `🇬🇷 *ITINERAR KEFALONIA (20-26 SEPTEMBRIE 2026)*\n\n`;

    TRIP_DAYS.forEach(day => {
      const dayItin = roomState.itineraries[day.dayNumber];
      const acts = (dayItin?.activityIds || []).map(id => activityMap[id]).filter(Boolean);

      text += `📅 *${day.dayName}* (${day.theme})\n`;
      if (acts.length > 0) {
        acts.forEach((act, idx) => {
          text += `  ${idx + 1}. ${act.title} (${act.region} • ~${act.costPerPerson}€/pers)\n`;
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
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0"
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
                onClick={() => setActiveDayNum(day.dayNumber)}
                className={`px-3 py-2 rounded-xl border text-left transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 font-medium'
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
            <p className="text-xs text-slate-400 mt-0.5">
              💡 {currentDayData.notes}
            </p>
          </div>

          <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Buget zilnic</span>
            <span className="text-xs font-black text-amber-400">~{dayCostPerPerson}€ / pers</span>
          </div>
        </div>

        {/* TIMELINE ACTIVITIES */}
        {lockedActivitiesForDay.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Program Sugerat Ziua {activeDayNum}
            </h4>

            <div className="space-y-2.5">
              {lockedActivitiesForDay.map((activity, index) => {
                const timeSlotLabel = index === 0 ? 'Dimineața (09:30 - 13:00)' : index === 1 ? 'Prânz (13:30 - 16:00)' : index === 2 ? 'După-Amiază (16:30 - 19:00)' : 'Apus & Cină (19:30 - 22:00)';

                return (
                  <div key={activity.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-start justify-between gap-3 shadow-sm">
                    <div 
                      className="relative shrink-0 group cursor-pointer"
                      onClick={() => onOpenEditImage && onOpenEditImage(activity)}
                      title="Schimbă Imaginea"
                    >
                      <img 
                        src={activity.imageUrl} 
                        alt={activity.title} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-800 group-hover:opacity-80 transition"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition">
                        <Camera className="w-4 h-4 text-sky-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                        {timeSlotLabel}
                      </span>

                      <h5 className="font-bold text-white text-xs mt-1 truncate flex items-center justify-between">
                        <span>{activity.title}</span>
                        {onOpenEditImage && (
                          <button
                            onClick={() => onOpenEditImage(activity)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition"
                            title="Schimbă Imaginea"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </h5>

                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-300">{activity.region}</span>
                        <span>•</span>
                        <span className="text-amber-300">{activity.distanceFromVillaLouke}</span>
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        🚗 Parcare 2 mașini: {activity.carLogisticsNote}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveActivityFromDay(activity.id)}
                      className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition shrink-0"
                      title="Şterge din această zi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onUnlockDay(activeDayNum)}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition"
              >
                Golește planul pentru Ziua {activeDayNum}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-800 rounded-2xl text-center space-y-3 bg-slate-950/40">
            <p className="text-xs font-semibold text-slate-300">Ziua {activeDayNum} nu are activități adăugate încă.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                onClick={handleAutoFillTopVoted}
                className="w-full sm:w-auto px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
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
