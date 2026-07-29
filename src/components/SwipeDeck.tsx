import React, { useState, useMemo, useEffect } from 'react';
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
  Camera,
  ChevronLeft,
  ChevronRight
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

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const cardImages = useMemo(() => {
    if (!currentCard) return [];
    if (currentCard.images && currentCard.images.length > 0) {
      return currentCard.images;
    }
    return currentCard.imageUrl ? [currentCard.imageUrl] : [];
  }, [currentCard]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsFlipped(false);
  }, [currentCard?.id]);

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
    <div className="w-full max-w-md mx-auto flex flex-col gap-2 pb-2">
      {lastActionText && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-1 px-3 rounded-xl bg-slate-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-black shadow-lg"
        >
          {lastActionText}
        </motion.div>
      )}

      {/* MAIN SWIPE CARD CONTAINER */}
      <div className="relative w-full h-[580px] sm:h-[620px] flex items-center justify-center">
        <AnimatePresence>
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              style={{ x, y, rotate, opacity }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.99 }}
              className="absolute inset-0 w-full h-full bg-slate-900/30 backdrop-blur-2xl border border-white/20 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden cursor-grab active:cursor-grabbing select-none flex flex-col justify-between"
            >
              {/* SWIPE OVERLAY INDICATORS */}
              <motion.div 
                style={{ opacity: likeOpacity }} 
                className="absolute top-6 left-6 z-30 border-2 border-emerald-400/90 text-emerald-300 font-black text-xl sm:text-2xl uppercase tracking-wider px-4 py-1.5 rounded-2xl rotate-[-12deg] bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(52,211,153,0.5)] pointer-events-none"
              >
                LIKE ❤️
              </motion.div>

              <motion.div 
                style={{ opacity: passOpacity }} 
                className="absolute top-6 right-6 z-30 border-2 border-rose-500/90 text-rose-400 font-black text-xl sm:text-2xl uppercase tracking-wider px-4 py-1.5 rounded-2xl rotate-[12deg] bg-slate-950/70 backdrop-blur-xl shadow-[0_0_30px_rgba(244,63,94,0.5)] pointer-events-none"
              >
                PAS ❌
              </motion.div>

              <motion.div 
                style={{ opacity: superLikeOpacity }} 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 border-2 border-amber-400/90 text-amber-300 font-black text-xl sm:text-2xl uppercase tracking-wider px-5 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl shadow-[0_0_35px_rgba(251,191,36,0.6)] pointer-events-none"
              >
                SUPER LIKE ⭐
              </motion.div>

              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="relative w-full h-full flex flex-col justify-between">
                  {/* Photo & Background */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={cardImages[currentImageIndex] || currentCard.imageUrl} 
                      alt={currentCard.title} 
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                    {/* Glass Sheen Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Top Bar inside image */}
                  <div className="relative z-20 flex flex-col gap-2">
                    {/* Story Progress Bars for 2-3 Real Photos */}
                    {cardImages.length > 1 && (
                      <div className="pt-3 px-4 flex items-center gap-1.5">
                        {cardImages.map((_, imgIdx) => (
                          <button
                            key={imgIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(imgIdx);
                            }}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              imgIdx === currentImageIndex 
                                ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-y-110' 
                                : 'bg-white/35 hover:bg-white/60'
                            }`}
                            title={`Poza ${imgIdx + 1} din ${cardImages.length}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Integrated Top Glass Controls Row */}
                    <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                      {/* Category Selector */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950/70 backdrop-blur-xl border border-white/20 text-slate-100 text-xs font-black rounded-full px-3 py-1.5 focus:outline-none shadow-md cursor-pointer"
                      >
                        <option value="all">🌐 Toate ({totalCardsInDeck})</option>
                        <option value="beach">🏖️ Plaje</option>
                        <option value="taverna">🍲 Taverne</option>
                        <option value="culture">🏛️ Cultură</option>
                        <option value="sunset">🌅 Apus</option>
                        <option value="hike">🥾 Hike</option>
                        <option value="hidden_gem">💎 Perle Ascunse</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUndoLastVote();
                          }}
                          className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-sky-400 backdrop-blur-xl transition active:scale-90 shadow-md"
                          title="Anulează ultimul vot"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddModal();
                          }}
                          className="p-1.5 rounded-full bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-400/40 text-cyan-300 backdrop-blur-xl transition active:scale-90 shadow-md"
                          title="Adaugă opțiune nouă"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {onOpenEditImage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditImage(currentCard);
                            }}
                            className="p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 text-slate-200 backdrop-blur-xl transition active:scale-90 shadow-md"
                            title="Schimbă Poza Cardului"
                          >
                            <Camera className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                        )}

                        <span className="px-2.5 py-1 rounded-full text-xs font-black text-cyan-200 bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-xl shadow-md">
                          {currentCard.costPerPerson === 0 ? 'Gratuit' : `~${currentCard.costPerPerson}€`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows for Photos */}
                  {cardImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev - 1 + cardImages.length) % cardImages.length);
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/30 text-white backdrop-blur-md flex items-center justify-center transition active:scale-90 shadow-xl"
                        title="Poza anterioară"
                      >
                        <ChevronLeft className="w-5 h-5 text-cyan-200" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) => (prev + 1) % cardImages.length);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/30 text-white backdrop-blur-md flex items-center justify-center transition active:scale-90 shadow-xl"
                        title="Poza următoare"
                      >
                        <ChevronRight className="w-5 h-5 text-cyan-200" />
                      </button>
                    </>
                  )}

                  {/* Bottom Liquid Glass Info Panel */}
                  <div className="relative z-10 m-2.5 sm:m-3.5 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/60 backdrop-blur-2xl border border-white/20 shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] flex flex-col gap-2">
                    {currentCard.greekName && (
                      <span className="text-[11px] font-mono text-cyan-300 tracking-wider uppercase font-black drop-shadow">
                        {currentCard.greekName}
                      </span>
                    )}

                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                      {currentCard.title}
                    </h2>

                    {/* Meta Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 my-0.5">
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                        <MapPin className="w-3 h-3" />
                        {currentCard.region}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                        <Car className="w-3 h-3" />
                        {currentCard.distanceFromVillaLouke}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                        <Clock className="w-3 h-3 text-slate-300" />
                        {currentCard.estimatedDuration}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200/90 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                      {currentCard.description}
                    </p>

                    {/* Action & Info Buttons inside Card Glass Panel */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteAction('dislike');
                        }}
                        className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-300 font-black text-xs flex items-center justify-center gap-1 backdrop-blur-xl transition active:scale-95"
                        title="Pas (Glisează stânga)"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-[11px] font-extrabold">PAS</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlipped(true);
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-cyan-500/25 via-white/20 to-sky-500/25 hover:from-cyan-500/35 hover:to-sky-500/35 text-white text-xs font-extrabold rounded-xl border border-white/30 shadow-md backdrop-blur-xl transition active:scale-98 flex items-center justify-center gap-1.5"
                      >
                        <Info className="w-4 h-4 text-cyan-300" />
                        <span>Detalii</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteAction('superlike');
                        }}
                        className="py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 font-black text-xs flex items-center justify-center backdrop-blur-xl transition active:scale-95"
                        title="Super Like (Glisează sus)"
                      >
                        <Star className="w-4 h-4 fill-amber-300" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteAction('like');
                        }}
                        className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center justify-center gap-1 backdrop-blur-xl transition active:scale-95"
                        title="Like (Glisează dreapta)"
                      >
                        <Heart className="w-4 h-4 fill-emerald-300" />
                        <span className="text-[11px] font-extrabold">LIKE</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD (LIQUID GLASS DETAILS) */
                <div className="relative w-full h-full bg-slate-950/80 backdrop-blur-2xl p-4 sm:p-5 text-slate-200 flex flex-col justify-between overflow-y-auto border border-white/15">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <h3 className="font-extrabold text-base sm:text-lg text-white drop-shadow">{currentCard.title}</h3>
                      <button
                        onClick={() => setIsFlipped(false)}
                        className="p-1.5 rounded-xl bg-white/10 border border-white/15 text-slate-300 hover:text-white backdrop-blur-md transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-sm">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                          <Car className="w-4 h-4" />
                          Parcare & Drum (2 Mașini)
                        </div>
                        <p className="text-slate-300 leading-relaxed font-medium text-[11px] sm:text-xs">
                          {currentCard.carLogisticsNote}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-white mb-1.5">Highlights</h4>
                        <ul className="space-y-1">
                          {currentCard.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-200 text-[11px] sm:text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Real Location Photos Gallery */}
                      {cardImages.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                            <span>📸 Imagini Reale Locație ({cardImages.length})</span>
                            <span className="text-[10px] text-cyan-400">Apasă pentru selectare</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {cardImages.map((imgUrl, iIdx) => (
                              <button
                                key={iIdx}
                                onClick={() => {
                                  setCurrentImageIndex(iIdx);
                                  setIsFlipped(false);
                                }}
                                className={`relative h-14 rounded-xl overflow-hidden border transition active:scale-95 ${
                                  iIdx === currentImageIndex 
                                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-102' 
                                    : 'border-white/15 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={imgUrl} alt={`Foto ${iIdx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-1 px-1 rounded bg-slate-950/80 text-[9px] font-black text-white border border-white/20">
                                  #{iIdx + 1}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-3 w-full py-2.5 bg-white/15 hover:bg-white/20 text-white text-xs font-black rounded-xl border border-white/25 backdrop-blur-xl transition active:scale-98"
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
