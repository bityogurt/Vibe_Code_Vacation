import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Calendar, 
  Heart, 
  Star, 
  X, 
  Sparkles, 
  MapPin, 
  Car, 
  Euro, 
  Plus, 
  Filter,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoomState, Activity, VoteType, DayItinerary } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface ConsensusViewProps {
  roomState: RoomState;
  activeVotingDay: number;
  onLockActivitiesToDay: (dayNumber: number, activityIds: string[]) => void;
  onLockTop3ToDay: (dayNumber: number) => void;
  onSwitchToItinerary: () => void;
}

export const ConsensusView: React.FC<ConsensusViewProps> = ({
  roomState,
  activeVotingDay,
  onLockActivitiesToDay,
  onLockTop3ToDay,
  onSwitchToItinerary
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterScheduledStatus, setFilterScheduledStatus] = useState<'all' | 'unscheduled' | 'scheduled'>('unscheduled');
  const [selectedDayToLock, setSelectedDayToLock] = useState<number>(1);
  const [selectedForBatchLock, setSelectedForBatchLock] = useState<string[]>([]);

  // Calculate locked activity locations
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

  // Aggregate votes per activity
  const activityConsensusList = useMemo(() => {
    const totalMembers = Math.max(1, roomState.members.length);

    return roomState.activities.map(act => {
      let likesCount = 0;
      let superlikesCount = 0;
      let dislikesCount = 0;

      const likedMembers: { name: string; avatarColor: string; vote: VoteType }[] = [];
      const dislikedMembers: { name: string; avatarColor: string }[] = [];

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
            dislikedMembers.push({ name: member.name, avatarColor: member.avatarColor });
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
        dislikedMembers,
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

  const toggleSelectCardForBatch = (actId: string) => {
    if (selectedForBatchLock.includes(actId)) {
      setSelectedForBatchLock(prev => prev.filter(id => id !== actId));
    } else {
      if (selectedForBatchLock.length >= 4) {
        alert('Poți selecta maxim 4 activități per zi pentru un itinerar echilibrat!');
        return;
      }
      setSelectedForBatchLock(prev => [...prev, actId]);
    }
  };

  const handleBatchLockToSelectedDay = () => {
    if (selectedForBatchLock.length === 0) return;

    // Get current locked activities for this day
    const currentDayActivities = roomState.itineraries[selectedDayToLock]?.activityIds || [];
    const newCombinedList = Array.from(new Set([...currentDayActivities, ...selectedForBatchLock]));

    onLockActivitiesToDay(selectedDayToLock, newCombinedList);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });

    setSelectedForBatchLock([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-rose-900/90 p-5 rounded-3xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Rezultate Consens Grup ({roomState.members.length} Călători)
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Aici vezi ce activități au cel mai mare grad de acord între cei 5 utilizatori. Apasă butonul de mai jos pentru a încheia votul și a trimite automat TOP 3 în itinerar!
          </p>
        </div>

        {/* Auto Lock Top 3 Button */}
        <button
          onClick={() => {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
            onLockTop3ToDay(activeVotingDay);
          }}
          className="px-4 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 shrink-0 border border-amber-300/40"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          ⚡ Trimite TOP 3 Votate în Ziua {activeVotingDay}
        </button>
      </div>

      {/* Batch Lock Action Bar */}
      {selectedForBatchLock.length > 0 && (
        <div className="sticky top-16 z-30 bg-emerald-950/95 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-300 font-medium text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Ai selectat <strong>{selectedForBatchLock.length} activități</strong> pentru adăugare în itinerar!
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDayToLock}
              onChange={(e) => setSelectedDayToLock(Number(e.target.value))}
              className="bg-slate-900 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-xl p-2.5 focus:outline-none"
            >
              {TRIP_DAYS.map(day => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  Ziua {day.dayNumber}: {day.dayName.split(',')[1]}
                </option>
              ))}
            </select>

            <button
              onClick={handleBatchLockToSelectedDay}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 shrink-0"
            >
              <Calendar className="w-4 h-4" />
              Programează în Ziua {selectedDayToLock}
            </button>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
          <button
            onClick={() => setFilterScheduledStatus('unscheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterScheduledStatus === 'unscheduled'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ieșite din pool / Neasignate ({activityConsensusList.length})
          </button>
          <button
            onClick={() => setFilterScheduledStatus('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterScheduledStatus === 'scheduled'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deja Programate
          </button>
          <button
            onClick={() => setFilterScheduledStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterScheduledStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toate
          </button>
        </div>

        {/* Category selector */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl p-2.5 w-full sm:w-auto focus:outline-none"
        >
          <option value="all">Toate Categoriile</option>
          <option value="beach">🏖️ Plaje</option>
          <option value="hidden_gem">💎 Perle Ascunse</option>
          <option value="hike">🥾 Hike & Natură</option>
          <option value="taverna">🍲 Taverne</option>
          <option value="culture">🏛️ Cultură</option>
          <option value="sunset">🌅 Apus & Drinks</option>
        </select>
      </div>

      {/* CONSENSUS CARDS RANKED LIST */}
      <div className="space-y-3">
        {activityConsensusList.length > 0 ? (
          activityConsensusList.map((item, index) => {
            const isSelected = selectedForBatchLock.includes(item.activity.id);

            return (
              <div
                key={item.activity.id}
                className={`bg-slate-900 border ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-950/20' 
                    : item.scheduledDayNumber 
                    ? 'border-slate-800/60 opacity-75' 
                    : 'border-slate-800 hover:border-slate-700'
                } rounded-2xl p-4 transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Left Thumbnail & Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img 
                      src={item.activity.imageUrl} 
                      alt={item.activity.title} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-800"
                    />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-black border border-amber-400/20">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        {item.activity.title}
                      </h3>
                      
                      {item.scheduledDayNumber && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                          Programat în Ziua {item.scheduledDayNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>{item.activity.region}</span>
                      <span>•</span>
                      <span className="text-amber-300">{item.activity.distanceFromVillaLouke}</span>
                      <span>•</span>
                      <span className="text-emerald-300">
                        {item.activity.costPerPerson === 0 ? 'Gratuit' : `~${item.activity.costPerPerson}€/pers`}
                      </span>
                    </p>

                    {/* Member Votes Badges */}
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Votat de:</span>
                      
                      {item.likedMembers.length > 0 ? (
                        item.likedMembers.map((m, idx) => (
                          <span 
                            key={idx}
                            title={`${m.name}: ${m.vote === 'superlike' ? 'Super Like ⭐' : 'Like ❤️'}`}
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${m.avatarColor} text-white font-bold text-[10px] shadow-sm`}
                          >
                            {m.name}
                            {m.vote === 'superlike' ? <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> : <Heart className="w-2.5 h-2.5 fill-white" />}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Încă nu sunt voturi pozitive</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Consensus Score & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 shrink-0">
                  
                  {/* Consensus Score pill */}
                  <div className="text-left md:text-right mb-2">
                    <div className="flex items-center gap-1.5 md:justify-end">
                      <span className="text-lg font-black text-amber-400">{item.approvalPercentage}%</span>
                      <span className="text-xs text-slate-400">Aprobare</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ❤️ {item.likesCount} Like • ⭐ {item.superlikesCount} Super • ❌ {item.dislikesCount} Pas
                    </div>
                  </div>

                  {/* Select or Lock button */}
                  {!item.scheduledDayNumber ? (
                    <button
                      onClick={() => toggleSelectCardForBatch(item.activity.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          Selectat
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-emerald-400" />
                          Selectează pt Itinerar
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={onSwitchToItinerary}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 text-emerald-400 hover:bg-slate-800 flex items-center gap-1 border border-slate-700"
                    >
                      Vezi în Itinerar
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>

              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Nu am găsit activități conform filtrelor selectate.</p>
            <p className="text-xs text-slate-500 mt-1">Încearcă să schimbi categoria sau statusul filtrului.</p>
          </div>
        )}
      </div>

    </div>
  );
};
