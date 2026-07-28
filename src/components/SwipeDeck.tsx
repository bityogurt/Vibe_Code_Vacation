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
  CheckCircle2, 
  Compass,
  Sparkles,
  Plus,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Activity, UserProfile, Vote, VoteType, RoomState, DayItinerary } from '../types';
import { TRIP_DAYS, getMaxUnlockedVotingDay } from '../data/tripDates';

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
  onOpenEditImage?: (activity: Activity) => void;
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
  onOpenEditImage
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [lastActionText, setLastActionText] = useState<string | null>(null);

  const unlockedInfo = useMemo(() => getMaxUnlockedVotingDay(), []);

  // Motion values for swipe drag gesture
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-20, -100], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  // Find all activity IDs locked in daily itineraries
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

  // Unswiped activities
  const unswipedActivities = useMemo(() => {
    return roomState.activities.filter(act => {
      if (lockedActivityIds.has(act.id)) return false;
      if (userVotes[act.id]) return false;
      if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
      if (selectedRegion !== 'all' && act.region !== selectedRegion) return false;
      return true;
    });
  }, [roomState.activities, lockedActivityIds, userVotes, selectedCategory, selectedRegion]);

  const currentCard = unswipedActivities[0];
  const totalCardsInDeck = roomState.activities.length - lockedActivityIds.size;
  const swipedByCount = Object.keys(userVotes).length;

  const handleVoteAction = (voteType: VoteType) => {
    if (!currentCard) return;

    if (voteType === 'superlike') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setLastActionText(`⭐ Super Like: ${currentCard.title}`);
    } else if (voteType === 'like') {
      setLastActionText(`❤️ Adăugat: ${currentCard.title}`);
    } else {
      setLastActionText(`❌ Pasat: ${currentCard.title}`);
    }

    setTimeout(() => setLastActionText(null), 1500);
    setIsFlipped(false);
    x.set(0);
    y.set(0);

    onVote(currentCard.id, voteType);
  };

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 90;
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
    <div className="w-full h-[calc(100dvh-100px)] min-h-[580px] max-h-[780px] relative flex items-center justify-center">
      
      {/* SWIPE CARD CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              style={{ x, y, rotate, opacity }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.99 }}
              className="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-2xl border border-white/20 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_25px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden cursor-grab active:cursor-grabbing select-none flex flex-col justify-between"
            >
              {/* SWIPE OVERLAY INDICATORS */}
              <motion.div 
                style={{ opacity: likeOpacity }} 
                className="absolute top-6 left-6 z-30 border-2 border-emerald-400/90 text-emerald-300 font-black text-2xl uppercase tracking-wider px-4 py-1.5 rounded-2xl rotate-[-12deg] bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(52,211,153,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none"
              >
                LIKE ❤️
              </motion.div>

              <motion.div 
                style={{ opacity: passOpacity }} 
                className="absolute top-6 right-6 z-30 border-2 border-rose-500/90 text-rose-400 font-black text-2xl uppercase tracking-wider px-4 py-1.5 rounded-2xl rotate-[12deg] bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(244,63,94,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] pointer-events-none"
              >
                PAS ❌
              </motion.div>

              <motion.div 
                style={{ opacity: superLikeOpacity }} 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 border-2 border-amber-400/90 text-amber-300 font-black text-2xl uppercase tracking-wider px-5 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl shadow-[0_0_35px_rgba(251,191,36,0.6),inset_0_1px_1px_rgba(255,255,255,0.5)] pointer-events-none"
              >
                SUPER LIKE ⭐
              </motion.div>

              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="relative w-full h-full flex flex-col justify-between">
                  {/* Photo & Background */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={currentCard.imageUrl} 
                      alt={currentCard.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                    {/* Glass Sheen Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Top Glass Badges */}
                  <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide text-white bg-slate-950/60 backdrop-blur-xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_16px_rgba(0,0,0,0.4)]">
                      {currentCard.category === 'beach' && '🏖️ Plajă'}
                      {currentCard.category === 'hidden_gem' && '💎 Perlă Ascunsă'}
                      {currentCard.category === 'hike' && '🥾 Hike & Natură'}
                      {currentCard.category === 'taverna' && '🍲 Tavernă'}
                      {currentCard.category === 'culture' && '🏛️ Cultură'}
                      {currentCard.category === 'sunset' && '🌅 Apus & Drinks'}
                      {currentCard.category === 'boat_tour' && '🚤 Croazieră'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onOpenEditImage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditImage(currentCard);
                          }}
                          className="px-2.5 py-1.5 rounded-full text-xs font-bold text-white bg-slate-950/70 hover:bg-slate-900 border border-white/25 backdrop-blur-xl transition active:scale-95 shadow-md flex items-center gap-1"
                          title="Schimbă Poza Cardului"
                        >
                          <Camera className="w-3.5 h-3.5 text-sky-400" />
                          <span className="text-[10px] hidden sm:inline">Schimbă Poza</span>
                        </button>
                      )}

                      <span className="px-3 py-1.5 rounded-full text-xs font-black text-cyan-200 bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_15px_rgba(6,182,212,0.3)]">
                        {currentCard.costPerPerson === 0 ? 'Gratuit' : `~${currentCard.costPerPerson}€`}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Liquid Glass Info Panel */}
                  <div className="relative z-10 m-3.5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-950/70 backdrop-blur-2xl border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] flex flex-col gap-2">
                    {currentCard.greekName && (
                      <span className="text-xs font-mono text-cyan-300 tracking-wider uppercase font-black drop-shadow">
                        {currentCard.greekName}
                      </span>
                    )}

                    <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                      {currentCard.title}
                    </h2>

                    {/* Meta Pills */}
                    <div className="flex flex-wrap items-center gap-2 my-1">
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentCard.region}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-sm">
                        <Car className="w-3.5 h-3.5" />
                        {currentCard.distanceFromVillaLouke}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-slate-200 text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        {currentCard.estimatedDuration}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200/90 line-clamp-3 leading-relaxed font-normal">
                      {currentCard.description}
                    </p>

                    {/* Liquid Glass Flip Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      className="mt-2 w-full py-2.5 bg-gradient-to-r from-white/15 via-white/25 to-white/15 hover:from-white/25 hover:to-white/25 text-white text-xs font-extrabold rounded-xl sm:rounded-2xl border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl transition active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Info className="w-4 h-4 text-cyan-300" />
                      Detalii Parcare 2 Mașini & Sfaturi
                    </button>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD (LIQUID GLASS DETAILS) */
                <div className="relative w-full h-full bg-slate-950/85 backdrop-blur-2xl p-5 sm:p-6 text-slate-200 flex flex-col justify-between overflow-y-auto border border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-extrabold text-lg text-white drop-shadow">{currentCard.title}</h3>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-300 hover:text-white backdrop-blur-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                          <Car className="w-4 h-4" />
                          Parcare & Drum (2 Mașini)
                        </div>
                        <p className="text-slate-300 leading-relaxed font-medium">
                          {currentCard.carLogisticsNote}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-white mb-2">Highlights</h4>
                        <ul className="space-y-1.5">
                          {currentCard.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 w-full py-3 bg-white/15 hover:bg-white/20 text-white text-xs font-black rounded-2xl border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl transition active:scale-98"
                  >
                    Înapoi la Card
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* FINISHED CARDS STATE (LIQUID GLASS) */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900/60 backdrop-blur-2xl border border-white/20 rounded-[28px] sm:rounded-[36px] p-6 text-center text-slate-300 flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)]"
            >
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-xl flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-1.5 drop-shadow">Ai terminat cardurile!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Toate opțiunile disponibile au fost votate. Treci la secțiunea de Consens pentru a vedea alegerile grupului!
                </p>
              </div>

              <button
                onClick={onSwitchTabToConsensus}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.5)] transition active:scale-98 flex items-center justify-center gap-2 border border-white/30"
              >
                <Compass className="w-4 h-4" />
                Vezi Clasament & Consens Grup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
