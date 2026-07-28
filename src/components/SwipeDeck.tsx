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
  Plus
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
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  roomState,
  currentUser,
  activeVotingDay,
  onChangeVotingDay,
  onVote,
  onUndoLastVote,
  onOpenAddModal,
  onSwitchTabToConsensus
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
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-120px)] pb-4 space-y-3">
      
      {/* SWIPE CARD CONTAINER */}
      <div className="relative w-full aspect-[4/5] max-h-[420px] my-1 flex items-center justify-center">
        <AnimatePresence>
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              style={{ x, y, rotate, opacity }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.99 }}
              className="absolute inset-0 w-full h-full bg-slate-900 border border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none flex flex-col justify-between"
            >
              {/* SWIPE OVERLAY INDICATORS */}
              <motion.div 
                style={{ opacity: likeOpacity }} 
                className="absolute top-5 left-5 z-30 border-2 border-emerald-400 text-emerald-400 font-black text-xl uppercase tracking-wider px-3 py-1 rounded-xl rotate-[-12deg] bg-slate-950/80 backdrop-blur-md pointer-events-none"
              >
                LIKE ❤️
              </motion.div>

              <motion.div 
                style={{ opacity: passOpacity }} 
                className="absolute top-5 right-5 z-30 border-2 border-rose-500 text-rose-500 font-black text-xl uppercase tracking-wider px-3 py-1 rounded-xl rotate-[12deg] bg-slate-950/80 backdrop-blur-md pointer-events-none"
              >
                PAS ❌
              </motion.div>

              <motion.div 
                style={{ opacity: superLikeOpacity }} 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 border-2 border-amber-400 text-amber-300 font-black text-xl uppercase tracking-wider px-4 py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md pointer-events-none"
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
                  </div>

                  {/* Top Badges */}
                  <div className="relative z-10 p-3.5 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-white backdrop-blur-md border border-slate-700/80">
                      {currentCard.category === 'beach' && '🏖️ Plajă'}
                      {currentCard.category === 'hidden_gem' && '💎 Perlă Ascunsă'}
                      {currentCard.category === 'hike' && '🥾 Hike & Natură'}
                      {currentCard.category === 'taverna' && '🍲 Tavernă'}
                      {currentCard.category === 'culture' && '🏛️ Cultură'}
                      {currentCard.category === 'sunset' && '🌅 Apus & Drinks'}
                      {currentCard.category === 'boat_tour' && '🚤 Croazieră'}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-slate-950 backdrop-blur-md shadow-sm">
                      {currentCard.costPerPerson === 0 ? 'Gratuit' : `~${currentCard.costPerPerson}€ / pers`}
                    </span>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="relative z-10 p-4 text-slate-100 flex flex-col gap-1.5">
                    {currentCard.greekName && (
                      <span className="text-xs font-mono text-sky-300 tracking-wider uppercase font-bold">
                        {currentCard.greekName}
                      </span>
                    )}

                    <h2 className="text-xl font-extrabold text-white leading-tight">
                      {currentCard.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-medium my-0.5">
                      <span className="flex items-center gap-1 text-sky-300">
                        <MapPin className="w-3.5 h-3.5" />
                        {currentCard.region}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Car className="w-3.5 h-3.5" />
                        {currentCard.distanceFromVillaLouke}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3.5 h-3.5" />
                        {currentCard.estimatedDuration}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {currentCard.description}
                    </p>

                    {/* Flip Card details button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      className="mt-2 w-full py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 flex items-center justify-center gap-1.5 transition backdrop-blur-md"
                    >
                      <Info className="w-4 h-4 text-sky-400" />
                      Detalii Parcare 2 Mașini & Sfaturi
                    </button>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="relative w-full h-full bg-slate-900 p-5 text-slate-200 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="font-bold text-base text-white">{currentCard.title}</h3>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                          <Car className="w-4 h-4" />
                          Parcare & Drum (2 Mașini)
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {currentCard.carLogisticsNote}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-200 mb-1">Highlights</h4>
                        <ul className="space-y-1">
                          {currentCard.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    Înapoi la Card
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            /* FINISHED CARDS STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-slate-300 flex flex-col items-center justify-center gap-4 shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Ai terminat cardurile!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Toate opțiunile disponibile au fost votate. Treci la secțiunea de Consens pentru a vedea alegerile grupului!
                </p>
              </div>

              <button
                onClick={onSwitchTabToConsensus}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Vezi Clasament & Consens Grup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LARGE TOUCH ACTION BUTTONS */}
      {currentCard && (
        <div className="flex items-center justify-center gap-6 py-2 shrink-0">
          {/* PASS BUTTON */}
          <button
            onClick={() => handleVoteAction('dislike')}
            className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-rose-500 flex items-center justify-center shadow-lg transition active:scale-90"
            title="Nu îmi place (Swipe Stânga)"
          >
            <X className="w-7 h-7" />
          </button>

          {/* SUPER LIKE BUTTON */}
          <button
            onClick={() => handleVoteAction('superlike')}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-amber-400 flex items-center justify-center shadow-lg transition active:scale-90"
            title="Super Like (Swipe Sus)"
          >
            <Star className="w-6 h-6" />
          </button>

          {/* LIKE BUTTON */}
          <button
            onClick={() => handleVoteAction('like')}
            className="w-14 h-14 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/20 transition active:scale-90 font-black"
            title="Îmi place (Swipe Dreapta)"
          >
            <Heart className="w-7 h-7 fill-slate-950" />
          </button>
        </div>
      )}



    </div>
  );
};
