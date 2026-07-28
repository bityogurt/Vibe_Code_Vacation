import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Calendar, 
  Heart, 
  Star, 
  Sparkles, 
  Plus, 
  ChevronRight,
  Info,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomState, VoteType, DayItinerary, Activity } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface ConsensusViewProps {
  roomState: RoomState;
  activeVotingDay: number;
  onLockActivitiesToDay: (dayNumber: number, activityIds: string[]) => void;
  onLockTop3ToDay: (dayNumber: number) => void;
  onSwitchToItinerary: () => void;
  onOpenEditImage?: (activity: Activity) => void;
}

export const ConsensusView: React.FC<ConsensusViewProps> = ({
  roomState,
  activeVotingDay,
  onLockActivitiesToDay,
  onLockTop3ToDay,
  onSwitchToItinerary,
  onOpenEditImage
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterScheduledStatus, setFilterScheduledStatus] = useState<'all' | 'unscheduled' | 'scheduled'>('unscheduled');
  const [selectedDayToLock, setSelectedDayToLock] = useState<number>(activeVotingDay);

  // Map of activity scheduled day
  const activityScheduledDayMap = useMemo(() => {
    const map: Record<string, number> = {};
    (Object.entries(roomState.itineraries || {}) as [string, DayItinerary][]).forEach(([dayNumStr, day]) => {
      const dayNum = parseInt(dayNumStr);
      (day.activityIds || []).forEach(actId => {
        map[actId] = dayNum;
      });
    });
    return map;
  }, [roomState.itineraries]);

  // Ranked Consensus List
  const activityConsensusList = useMemo(() => {
    const totalMembers = Math.max(1, roomState.members.length);

    return roomState.activities.map(act => {
      let likesCount = 0;
      let superlikesCount = 0;
      let dislikesCount = 0;

      const likedMembers: { name: string; avatarColor: string; vote: VoteType }[] = [];

      roomState.members.forEach(member => {
        const key = `${member.id}_${act.id}`;
        const voteObj = roomState.votes[key];

        if (voteObj) {
          if (voteObj.vote === 'like') {
            likesCount++;
            likedMembers.push({ name: member.name, avatarColor: member.avatarColor, vote: 'like' });
          } else if (voteObj.vote === 'superlike') {
            superlikesCount++;
            likedMembers.push({ name: member.name, avatarColor: member.avatarColor, vote: 'superlike' });
          } else if (voteObj.vote === 'dislike') {
            dislikesCount++;
          }
        }
      });

      const totalPositive = likesCount + superlikesCount;
      const approvalPercentage = Math.round((totalPositive / totalMembers) * 100);
      const score = (likesCount * 1) + (superlikesCount * 2) - (dislikesCount * 0.5);

      return {
        activity: act,
        likesCount,
        superlikesCount,
        dislikesCount,
        totalPositive,
        approvalPercentage,
        score,
        likedMembers,
        scheduledDayNumber: activityScheduledDayMap[act.id] || null
      };
    })
    .filter(item => {
      if (filterCategory !== 'all' && item.activity.category !== filterCategory) return false;
      if (filterScheduledStatus === 'unscheduled' && item.scheduledDayNumber !== null) return false;
      if (filterScheduledStatus === 'scheduled' && item.scheduledDayNumber === null) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || b.approvalPercentage - a.approvalPercentage);
  }, [roomState, activityScheduledDayMap, filterCategory, filterScheduledStatus]);

  const handleDirectLockToDay = (actId: string, dayNum: number) => {
    const currentDayActivities = roomState.itineraries[dayNum]?.activityIds || [];
    if (currentDayActivities.includes(actId)) return;

    const newCombined = [...currentDayActivities, actId];
    onLockActivitiesToDay(dayNum, newCombined);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="w-full space-y-4 pb-6">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Top Consens Grup</h2>
              <p className="text-[11px] text-slate-400">Activități clasate după numărul de voturi</p>
            </div>
          </div>

          <button
            onClick={() => {
              confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
              onLockTop3ToDay(activeVotingDay);
            }}
            className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trimite Top 3 în Ziua {activeVotingDay}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setFilterScheduledStatus('unscheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterScheduledStatus === 'unscheduled'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            De Programat ({activityConsensusList.length})
          </button>
          <button
            onClick={() => setFilterScheduledStatus('scheduled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterScheduledStatus === 'scheduled'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Deja Programate
          </button>
          <button
            onClick={() => setFilterScheduledStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterScheduledStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            Toate
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER SELECTOR */}
      <div className="flex items-center gap-2">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl p-2.5 focus:outline-none"
        >
          <option value="all">Toate Categoriile</option>
          <option value="beach">🏖️ Plaje</option>
          <option value="hidden_gem">💎 Perle Ascunse</option>
          <option value="hike">🥾 Hike & Natură</option>
          <option value="taverna">🍲 Taverne & Mâncare</option>
          <option value="culture">🏛️ Cultură & Istorie</option>
          <option value="sunset">🌅 Apus & Drinks</option>
        </select>
      </div>

      {/* RANKED LIST OF ACTIVITIES */}
      <div className="space-y-3">
        {activityConsensusList.length > 0 ? (
          activityConsensusList.map((item, index) => (
            <div
              key={item.activity.id}
              className={`bg-slate-900 border ${
                item.scheduledDayNumber 
                  ? 'border-emerald-500/30 bg-emerald-950/10' 
                  : 'border-slate-800'
              } rounded-2xl p-3.5 space-y-3 transition shadow-md`}
            >
              {/* Card Header & Rank */}
              <div className="flex items-start gap-3">
                <div 
                  className="relative shrink-0 group cursor-pointer"
                  onClick={() => onOpenEditImage && onOpenEditImage(item.activity)}
                  title="Apasă pentru a schimba imaginea"
                >
                  <img 
                    src={item.activity.imageUrl} 
                    alt={item.activity.title} 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 group-hover:opacity-80 transition"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-950/80 backdrop-blur-md text-sky-400 text-[10px] font-black border border-sky-400/20">
                    #{index + 1}
                  </span>
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition">
                    <Camera className="w-5 h-5 text-sky-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-white text-sm truncate">
                      {item.activity.title}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onOpenEditImage && (
                        <button
                          onClick={() => onOpenEditImage(item.activity)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Schimbă Imaginea"
                        >
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                      )}
                      <span className="text-xs font-black text-sky-400">
                        {item.approvalPercentage}%
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.activity.region} • <span className="text-amber-300">{item.activity.distanceFromVillaLouke}</span>
                  </p>

                  {/* Liked Members Avatars */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-medium">Votat de:</span>
                    {item.likedMembers.length > 0 ? (
                      item.likedMembers.map((m, idx) => (
                        <span 
                          key={idx}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md ${m.avatarColor} text-white font-bold text-[9px]`}
                        >
                          {m.name}
                          {m.vote === 'superlike' ? <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> : <Heart className="w-2.5 h-2.5 fill-white" />}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Niciun vot pozitiv</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar for Card */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {item.scheduledDayNumber ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>În itinerar Ziua {item.scheduledDayNumber}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    <select
                      value={selectedDayToLock}
                      onChange={(e) => setSelectedDayToLock(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2 py-2 focus:outline-none flex-1 font-medium"
                    >
                      {TRIP_DAYS.map(day => (
                        <option key={day.dayNumber} value={day.dayNumber}>
                          Ziua {day.dayNumber}: {day.dayName.split(',')[0]}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDirectLockToDay(item.activity.id, selectedDayToLock)}
                      className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Programează
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">Nu am găsit activități conform filtrelor.</p>
          </div>
        )}
      </div>

    </div>
  );
};
