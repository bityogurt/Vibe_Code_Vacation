import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Euro, 
  Trash2, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomState, Activity, DayItinerary } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface ItineraryViewProps {
  roomState: RoomState;
  onUnlockDay: (dayNumber: number) => void;
  onLockActivitiesToDay: (dayNumber: number, activityIds: string[]) => void;
  onSwitchToConsensus: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  roomState,
  onUnlockDay,
  onLockActivitiesToDay,
  onSwitchToConsensus
}) => {
  const [activeDayNum, setActiveDayNum] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Map of activity objects by ID for fast lookup
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

  // Calculate daily costs
  const dayCostPerPerson = lockedActivitiesForDay.reduce((acc, act) => acc + act.costPerPerson, 0);
  const dayCostGroupTotal = dayCostPerPerson * 5;

  // Auto fill top 3 voted unassigned activities into current day
  const handleAutoFillTopVoted = () => {
    // Find all unassigned activities sorted by consensus
    const lockedSet = new Set<string>();
    (Object.values(roomState.itineraries || {}) as DayItinerary[]).forEach(day => {
      (day.activityIds || []).forEach(id => lockedSet.add(id));
    });

    const unassigned = roomState.activities.filter(act => !lockedSet.has(act.id));

    // Sort by likes
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
      alert('Nu mai sunt activități neasignate în pool!');
      return;
    }

    onLockActivitiesToDay(activeDayNum, topToPick);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRemoveActivityFromDay = (actIdToRemove: string) => {
    const remaining = (currentDayData.activityIds || []).filter(id => id !== actIdToRemove);
    onLockActivitiesToDay(activeDayNum, remaining);
  };

  const handleCopyWhatsAppItinerary = () => {
    let text = `🇬🇷 *ITINERAR KEFALONIA 2026 - VILLA LOUKE*\n\n`;

    TRIP_DAYS.forEach(day => {
      const dayItin = roomState.itineraries[day.dayNumber];
      const acts = (dayItin?.activityIds || []).map(id => activityMap[id]).filter(Boolean);

      text += `📅 *${day.dayName}* (${day.theme})\n`;
      if (acts.length > 0) {
        acts.forEach((act, idx) => {
          text += `  ${idx + 1}. ${act.title} (${act.region} • ~${act.costPerPerson}€/pers)\n`;
        });
      } else {
        text += `  *(Liber / În curs de votare)*\n`;
      }
      text += `\n`;
    });

    text += `🚘 *Echipă:* 5 Turiști • 2 Mașini • Cazare Villa Louke`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Itinerar Zilnic (20 - 26 Iulie 2026)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Cea mai votată selecție de 3-4 activități pe zi pentru o vacanță echilibrată fără aglomerație sau stres la drum.
          </p>
        </div>

        <button
          onClick={handleCopyWhatsAppItinerary}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
        >
          {copiedText ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Copiat pentru WhatsApp!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Copiază pe WhatsApp (5 Oameni)</span>
            </>
          )}
        </button>
      </div>

      {/* Days Tabs (7 Days) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {TRIP_DAYS.map(day => {
          const count = roomState.itineraries[day.dayNumber]?.activityIds?.length || 0;
          const isActive = activeDayNum === day.dayNumber;

          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayNum(day.dayNumber)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                isActive
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                Ziua {day.dayNumber}
              </div>
              <div className="font-bold text-xs leading-tight">
                {day.dayName.split(',')[0]}
              </div>
              <div className="text-[10px] font-semibold flex items-center justify-between mt-1">
                <span>{day.dayName.split(',')[1]}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? 'bg-slate-950 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                  {count} act
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIVE DAY ITINERARY CONTENT */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
        
        {/* Day Summary Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Ziua {currentDayData.dayNumber} • {currentDayData.dayName}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {currentDayData.theme}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              💡 {currentDayData.notes}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shrink-0">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Buget Proiectat</div>
              <div className="text-sm font-black text-amber-400">
                ~{dayCostPerPerson}€ <span className="text-[10px] text-slate-400 font-normal">/pers (~{dayCostGroupTotal}€ grup)</span>
              </div>
            </div>
          </div>
        </div>

        {/* LOCKED ACTIVITIES TIMELINE FOR THIS DAY */}
        {lockedActivitiesForDay.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Program Sugerat pentru Ziua {activeDayNum}
            </h4>

            <div className="relative border-l-2 border-emerald-500/30 ml-3 pl-5 space-y-6">
              {lockedActivitiesForDay.map((activity, index) => {
                const timeSlotLabel = index === 0 ? 'Dimineața (09:30 - 13:00)' : index === 1 ? 'Prânz & Chill (13:30 - 16:00)' : index === 2 ? 'După-Amiază (16:30 - 19:00)' : 'Apus & Cină (19:30 - 22:00)';

                return (
                  <div key={activity.id} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 ring-2 ring-emerald-500/20" />

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 transition hover:border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left Info */}
                      <div className="flex items-start gap-3.5">
                        <img 
                          src={activity.imageUrl} 
                          alt={activity.title} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {timeSlotLabel}
                          </span>

                          <h5 className="font-bold text-white text-base mt-1">
                            {activity.title}
                          </h5>

                          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                            <span className="text-rose-300">{activity.region}</span>
                            <span>•</span>
                            <span className="text-amber-300">{activity.distanceFromVillaLouke}</span>
                            <span>•</span>
                            <span className="text-emerald-300">
                              {activity.costPerPerson === 0 ? 'Gratuit' : `~${activity.costPerPerson}€/pers`}
                            </span>
                          </p>

                          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                            🚗 2 Mașini: {activity.carLogisticsNote}
                          </p>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveActivityFromDay(activity.id)}
                        className="self-end sm:self-center p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                        title="Scoate din această zi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear Day Button */}
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
          /* EMPTY DAY STATE */
          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-4 bg-slate-950/40">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Ziua {activeDayNum} nu are activități programate încă</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Alege cele mai votate activități din lista de consens sau lasă asistentul să aleagă automat top 3 opțiuni neocupate!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleAutoFillTopVoted}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Umple Automat cu Top 3 Cele Mai Votate
              </button>

              <button
                onClick={onSwitchToConsensus}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
              >
                Alege din Listă Consens
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
