import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Heart, 
  X, 
  Star, 
  RotateCcw, 
  Info, 
  MapPin, 
  Car, 
  Clock, 
  Euro, 
  Sparkles, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Layers,
  Compass,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Activity, ActivityCategory, KefaloniaRegion, UserProfile, Vote, VoteType, RoomState, DayItinerary } from '../types';
import { TRIP_DAYS } from '../data/tripDates';

interface SwipeDeckProps {
  roomState: RoomState;
  currentUser: UserProfile;
  activeVotingDay: number;
  onChangeVotingDay: (dayNumber: number) => void;
  onVote: (activityId: string, voteType: VoteType) => void;
  onUndoLastVote: () => void;
  onOpenAddModal: () => void;
  onSwitchTabToConsensus: () => void;
  onLockTop3ToDay: (dayNumber: number) => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  roomState,
  currentUser,
  activeVotingDay,
  onChangeVotingDay,
  onVote,
  onUndoLastVote,
  onOpenAddModal,
  onSwitchTabToConsensus,
  onLockTop3ToDay
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(100);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string | null>(null);

  // Current active day info
  const activeDayObj = TRIP_DAYS.find(d => d.dayNumber === activeVotingDay) || TRIP_DAYS[0];

  // Motion values for swipe drag gesture
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const likeOpacity = useTransform(x, [10, 100], [0, 1]);
  const passOpacity = useTransform(x, [-10, -100], [0, 1]);
  const superLikeOpacity = useTransform(y, [-10, -100], [0, 1]);

  // Find all activity IDs that are already locked in daily itineraries
  const lockedActivityIds = useMemo(() => {
    const set = new Set<string>();
    (Object.values(roomState.itineraries || {}) as DayItinerary[]).forEach(day => {
      (day.activityIds || []).forEach(id => set.add(id));
    });
    return set;
  }, [roomState.itineraries]);

  // User votes map
  const userVotes = useMemo(() => {
    const map: Record<string, VoteType> = {};
    (Object.values(roomState.votes || {}) as Vote[]).forEach(v => {
      if (v.userId === currentUser.id) {
        map[v.activityId] = v.vote;
      }
    });
    return map;
  }, [roomState.votes, currentUser.id]);

  // Filter remaining activities that user hasn't voted on AND aren't locked in an itinerary
  const unswipedActivities = useMemo(() => {
    return roomState.activities.filter(act => {
      // 1. Must not be locked in a day itinerary
      if (lockedActivityIds.has(act.id)) return false;
      // 2. Must not be already voted by this user
      if (userVotes[act.id]) return false;
      // 3. Category filter
      if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
      // 4. Region filter
      if (selectedRegion !== 'all' && act.region !== selectedRegion) return false;
      // 5. Budget filter
      if (act.costPerPerson > maxBudgetFilter) return false;

      return true;
    });
  }, [roomState.activities, lockedActivityIds, userVotes, selectedCategory, selectedRegion, maxBudgetFilter]);

  const currentCard = unswipedActivities[0];
  const totalCardsInDeck = roomState.activities.length - lockedActivityIds.size;
  const swipedByCount = Object.keys(userVotes).length;

  const handleVoteAction = (voteType: VoteType) => {
    if (!currentCard) return;

    if (voteType === 'superlike') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setLastActionText(`⭐ Super Like: ${currentCard.title}`);
    } else if (voteType === 'like') {
      setLastActionText(`❤️ Amimat: ${currentCard.title}`);
    } else {
      setLastActionText(`❌ Pasat: ${currentCard.title}`);
    }

    setTimeout(() => setLastActionText(null), 1800);
    setIsFlipped(false);
    x.set(0);
    y.set(0);

    onVote(currentCard.id, voteType);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleVoteAction('like');
    } else if (info.offset.x < -threshold) {
      handleVoteAction('dislike');
    } else if (info.offset.y < -threshold) {
      handleVoteAction('superlike');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-2 flex flex-col items-center">
      
      {/* COMPACT ACTIVE VOTING DAY BAR */}
      <div className="w-full mb-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              Vot Ziua {activeVotingDay} ({activeDayObj.dayName.split(',')[1]?.trim()})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <select
              value={activeVotingDay}
              onChange={(e) => onChangeVotingDay(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] font-semibold rounded-lg px-2 py-1 focus:outline-none"
            >
              {TRIP_DAYS.map(day => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  Ziua {day.dayNumber}: {day.dayName.split(',')[1]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters & Add Card inline */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-xs">
          <div className="flex items-center gap-1.5 flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-1.5 focus:outline-none w-1/2"
            >
              <option value="all">Toate Categoriile</option>
              <option value="beach">🏖️ Plaje</option>
              <option value="hidden_gem">💎 Perle</option>
              <option value="hike">🥾 Hike</option>
              <option value="taverna">🍲 Taverne</option>
              <option value="culture">🏛️ Cultură</option>
              <option value="sunset">🌅 Apus</option>
              <option value="boat_tour">🚤 Barca</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg p-1.5 focus:outline-none w-1/2"
            >
              <option value="all">Toate Regiunile</option>
              <option value="South (Livatho/Lourdas)">📍 Sud</option>
              <option value="North (Fiskardo/Assos)">📍 Nord</option>
              <option value="West (Paliki/Lixouri)">📍 Vest</option>
              <option value="East (Sami/Antisamos)">📍 Est</option>
              <option value="Central (Argostoli/Ainos)">📍 Centru</option>
            </select>
          </div>

          <button 
            onClick={onOpenAddModal}
            className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold shrink-0 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg"
          >
            + Card
          </button>
        </div>
      </div>

      {/* Progress Bar & Status Toast */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Progres vot: <strong className="text-slate-200">{swipedByCount} / {totalCardsInDeck}</strong></span>
        </div>
        
        {swipedByCount > 0 && (
          <button
            onClick={onUndoLastVote}
            className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-xs font-medium transition"
          >
            <RotateCcw className="w-3 h-3" />
            Anulează ultimul swipe
          </button>
        )}
      </div>

      <div className="w-full bg-slate-800/60 rounded-full h-1.5 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.round((swipedByCount / (totalCardsInDeck || 1)) * 100))}%` }}
        />
      </div>

      {/* Toast Banner for Last Swipe Action */}
      {lastActionText && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-2 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-full font-medium shadow-lg"
        >
          {lastActionText}
        </motion.div>
      )}

      {/* CARD STACK AREA */}
      <div className="relative w-full aspect-[3/4.2] max-w-sm flex items-center justify-center">
        <AnimatePresence>
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              style={{ x, y, rotate, opacity }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 1.02 }}
              className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex flex-col justify-between"
            >
              {/* SWIPE OVERLAY INDICATORS */}
              <motion.div 
                style={{ opacity: likeOpacity }} 
                className="absolute top-6 left-6 z-30 border-4 border-emerald-400 text-emerald-400 font-black text-2xl uppercase tracking-wider px-3 py-1 rounded-xl rotate-[-15deg] bg-slate-950/60 backdrop-blur-sm pointer-events-none"
              >
                VOTAT LIKE ❤️
              </motion.div>

              <motion.div 
                style={{ opacity: passOpacity }} 
                className="absolute top-6 right-6 z-30 border-4 border-rose-500 text-rose-500 font-black text-2xl uppercase tracking-wider px-3 py-1 rounded-xl rotate-[15deg] bg-slate-950/60 backdrop-blur-sm pointer-events-none"
              >
                PAS ❌
              </motion.div>

              <motion.div 
                style={{ opacity: superLikeOpacity }} 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 border-4 border-amber-400 text-amber-300 font-black text-2xl uppercase tracking-wider px-4 py-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md pointer-events-none"
              >
                SUPER LIKE ⭐
              </motion.div>

              {!isFlipped ? (
                /* --- FRONT OF CARD --- */
                <div className="relative w-full h-full flex flex-col justify-between">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={currentCard.imageUrl} 
                      alt={currentCard.title} 
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
                  </div>

                  {/* Top Badges */}
                  <div className="relative z-10 p-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
                      {currentCard.category === 'beach' && '🏖️ Plajă'}
                      {currentCard.category === 'hidden_gem' && '💎 Perlá Ascunsă'}
                      {currentCard.category === 'hike' && '🥾 Hike & Natură'}
                      {currentCard.category === 'taverna' && '🍲 Tavernă'}
                      {currentCard.category === 'culture' && '🏛️ Cultură'}
                      {currentCard.category === 'sunset' && '🌅 Apus & Drinks'}
                      {currentCard.category === 'boat_tour' && '🚤 Croazieră'}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-slate-950 font-bold backdrop-blur-md">
                      {currentCard.costPerPerson === 0 ? 'Gratuit' : `~${currentCard.costPerPerson}€ / pers`}
                    </span>
                  </div>

                  {/* Bottom Card Information */}
                  <div className="relative z-10 p-5 text-slate-100 flex flex-col gap-2">
                    {currentCard.greekName && (
                      <span className="text-xs font-mono text-cyan-300 tracking-widest uppercase">
                        {currentCard.greekName}
                      </span>
                    )}

                    <h2 className="text-2xl font-black text-white leading-tight">
                      {currentCard.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-medium my-1">
                      <span className="flex items-center gap-1 text-rose-300">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentCard.region}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Car className="w-3.5 h-3.5" />
                        {currentCard.distanceFromVillaLouke}
                      </span>
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3.5 h-3.5" />
                        {currentCard.estimatedDuration}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {currentCard.description}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {currentCard.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/10">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Flip Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      className="mt-3 w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition backdrop-blur-md"
                    >
                      <Info className="w-4 h-4 text-cyan-400" />
                      Vezi Detalii Parcare & Recomandări 2 Mașini
                    </button>
                  </div>
                </div>
              ) : (
                /* --- BACK OF CARD (DETAILED VIEW) --- */
                <div className="relative w-full h-full bg-slate-900 p-5 text-slate-200 flex flex-col justify-between overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                      <h3 className="font-bold text-lg text-white">{currentCard.title}</h3>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Logistics Section */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                          <Car className="w-4 h-4" />
                          Logistică 2 Mașini & Parcare
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {currentCard.carLogisticsNote}
                        </p>
                        <div className="mt-1.5 text-[11px] text-slate-400">
                          Dificultate parcare: <strong className="text-white">{currentCard.carParkingDifficulty}</strong> • Distanță de la Villa Louke: <strong className="text-cyan-300">{currentCard.distanceFromVillaLouke}</strong>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div>
                        <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Puncte Forte
                        </h4>
                        <ul className="space-y-1">
                          {currentCard.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Description */}
                      <div>
                        <h4 className="font-bold text-slate-300 mb-1">Descriere detaliată</h4>
                        <p className="text-slate-300 leading-relaxed">
                          {currentCard.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1"
                  >
                    Înapoi la Card
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* EMPTY DECK STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-300 flex flex-col items-center justify-center gap-4 shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Ai votat toate cardurile!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Felicitări! Ai parcurs pachetul de activități din Kefalonia. Vezi ce au votat și ceilalți prieteni din grup!
                </p>
              </div>

              <button
                onClick={onSwitchTabToConsensus}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Vezi Rezultatele & Consensul Grupului
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SWIPE ACTION BUTTONS */}
      {currentCard && (
        <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-xs">
          {/* PASS BUTTON */}
          <button
            onClick={() => handleVoteAction('dislike')}
            className="w-14 h-14 rounded-full bg-slate-900 hover:bg-rose-950/80 text-rose-500 border-2 border-rose-500/40 hover:border-rose-500 flex items-center justify-center shadow-lg transition-transform active:scale-90 group"
            title="Pas / Nu mă atrage (Swipe Stânga)"
          >
            <X className="w-7 h-7 group-hover:scale-110 transition-transform" />
          </button>

          {/* SUPER LIKE BUTTON */}
          <button
            onClick={() => handleVoteAction('superlike')}
            className="w-12 h-12 rounded-full bg-slate-900 hover:bg-amber-950/80 text-amber-400 border-2 border-amber-400/40 hover:border-amber-400 flex items-center justify-center shadow-lg transition-transform active:scale-90 group"
            title="Super Like / Absolut de făcut (Swipe Sus)"
          >
            <Star className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* LIKE BUTTON */}
          <button
            onClick={() => handleVoteAction('like')}
            className="w-14 h-14 rounded-full bg-slate-900 hover:bg-emerald-950/80 text-emerald-400 border-2 border-emerald-400/40 hover:border-emerald-400 flex items-center justify-center shadow-lg transition-transform active:scale-90 group"
            title="Îmi Place / Votat (Swipe Dreapta)"
          >
            <Heart className="w-7 h-7 fill-emerald-400/20 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Mobile Tip */}
      <p className="text-[11px] text-slate-500 text-center mt-4">
        💡 Trage cardul spre <strong>dreapta</strong> pentru ❤️ Like, <strong>stânga</strong> pentru ❌ Pas, sau <strong>sus</strong> pentru ⭐ Super-like!
      </p>

    </div>
  );
};
