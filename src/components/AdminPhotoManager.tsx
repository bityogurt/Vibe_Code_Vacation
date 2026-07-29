import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Star, 
  Search, 
  Filter, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  Sparkles, 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Activity, UserProfile, RoomState, ActivityCategory } from '../types';

interface AdminPhotoManagerProps {
  roomState: RoomState;
  currentUser: UserProfile;
  roomId: string;
  onUpdateRoomState: (newRoomState: RoomState) => void;
}

export const AdminPhotoManager: React.FC<AdminPhotoManagerProps> = ({
  roomState,
  currentUser,
  roomId,
  onUpdateRoomState
}) => {
  // Access state: Admin if currentUser is Codin or admin role, or if unlocked via PIN
  const [pinInput, setPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return (
      currentUser.isAdmin || 
      currentUser.name.toLowerCase() === 'codin' || 
      localStorage.getItem('kefalonia_admin_unlocked') === 'true'
    );
  });

  const [pinError, setPinError] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMissing, setFilterMissing] = useState<boolean>(false);

  // Local pending modifications map: activityId -> { imageUrl: string, images: string[] }
  const [localActivities, setLocalActivities] = useState<Activity[]>(roomState.activities);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  // URL input per card
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({});

  // Sync if roomState updates externally
  React.useEffect(() => {
    setLocalActivities(roomState.activities);
  }, [roomState.activities]);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'codin' || pinInput === '2026') {
      setIsUnlocked(true);
      localStorage.setItem('kefalonia_admin_unlocked', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleDirectCodinAuth = () => {
    setIsUnlocked(true);
    localStorage.setItem('kefalonia_admin_unlocked', 'true');
  };

  // Curated fallback photo suggestions for Kefalonia locations
  const KEFALONIA_PRESET_IMAGES: Record<string, string[]> = {
    'myrtos': [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
    ],
    'assos': [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop'
    ],
    'melissani': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
    ],
    'fiskardo': [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop'
    ],
    'petani': [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1200&auto=format&fit=crop'
    ]
  };

  // Helper to handle multi-file upload for an activity
  const handleFileUpload = (activityId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const readPromises = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newBase64Images => {
      setLocalActivities(prev => prev.map(act => {
        if (act.id !== activityId) return act;

        const currentImages = act.images && act.images.length > 0 ? [...act.images] : [act.imageUrl];
        const combined = [...currentImages, ...newBase64Images];
        return {
          ...act,
          images: combined,
          imageUrl: combined[0]
        };
      }));
    });
  };

  // Add image URL
  const handleAddUrl = (activityId: string) => {
    const url = urlInputs[activityId]?.trim();
    if (!url) return;

    setLocalActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;

      const currentImages = act.images && act.images.length > 0 ? [...act.images] : [act.imageUrl];
      const combined = [...currentImages, url];
      return {
        ...act,
        images: combined,
        imageUrl: combined[0]
      };
    }));

    setUrlInputs(prev => ({ ...prev, [activityId]: '' }));
  };

  // Set as main cover image
  const handleSetCover = (activityId: string, selectedImage: string) => {
    setLocalActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;

      const currentImages = act.images || [act.imageUrl];
      // Move selected image to first position in array
      const filtered = currentImages.filter(img => img !== selectedImage);
      const newImages = [selectedImage, ...filtered];

      return {
        ...act,
        imageUrl: selectedImage,
        images: newImages
      };
    }));
  };

  // Remove image from gallery
  const handleRemoveImage = (activityId: string, imageToRemove: string) => {
    setLocalActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;

      const currentImages = act.images || [act.imageUrl];
      const updatedImages = currentImages.filter(img => img !== imageToRemove);
      const newMain = updatedImages[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200';

      return {
        ...act,
        imageUrl: newMain,
        images: updatedImages.length > 0 ? updatedImages : [newMain]
      };
    }));
  };

  // Auto load preset real images
  const handleLoadPresets = (activityId: string, title: string) => {
    const lower = title.toLowerCase();
    let preset: string[] = [
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop'
    ];

    for (const key of Object.keys(KEFALONIA_PRESET_IMAGES)) {
      if (lower.includes(key)) {
        preset = KEFALONIA_PRESET_IMAGES[key];
        break;
      }
    }

    setLocalActivities(prev => prev.map(act => {
      if (act.id !== activityId) return act;
      return {
        ...act,
        images: preset,
        imageUrl: preset[0]
      };
    }));
  };

  // Save single activity changes to server
  const handleSaveActivity = async (activity: Activity) => {
    setSavingId(activity.id);
    try {
      const res = await fetch(`/api/rooms/${roomId}/update-activity-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          images: activity.images || [activity.imageUrl],
          mainImageUrl: activity.imageUrl
        })
      });

      const data = await res.json();
      if (data.success && data.room) {
        onUpdateRoomState(data.room);
        setSavedSuccessId(activity.id);
        setTimeout(() => setSavedSuccessId(null), 2500);
      }
    } catch (err) {
      console.error('Eroare la salvarea pozelor:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Save ALL modified activities at once
  const handleBatchSaveAll = async () => {
    setIsBatchSaving(true);
    setBatchMessage('Se salvează pozele pe server...');

    try {
      const updates = localActivities.map(act => ({
        activityId: act.id,
        images: act.images || [act.imageUrl],
        imageUrl: act.imageUrl
      }));

      const res = await fetch(`/api/rooms/${roomId}/batch-update-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      const data = await res.json();
      if (data.success && data.room) {
        onUpdateRoomState(data.room);
        setBatchMessage('✅ Toate pozele au fost salvate cu succes!');
        setTimeout(() => setBatchMessage(null), 3000);
      }
    } catch (err) {
      console.error('Eroare salvare batch:', err);
      setBatchMessage('❌ Eroare la salvarea pozelor.');
    } finally {
      setIsBatchSaving(false);
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return localActivities.filter(act => {
      const matchesSearch = searchQuery === '' || 
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.greekName && act.greekName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        act.region.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || act.category === selectedCategory;

      const imgCount = act.images?.length || (act.imageUrl ? 1 : 0);
      const matchesMissing = !filterMissing || imgCount < 2;

      return matchesSearch && matchesCat && matchesMissing;
    });
  }, [localActivities, searchQuery, selectedCategory, filterMissing]);

  // Total stats
  const totalCards = localActivities.length;
  const cardsWithMultiplePhotos = localActivities.filter(a => (a.images?.length || 0) >= 2).length;
  const totalPhotosUploaded = localActivities.reduce((sum, a) => sum + (a.images?.length || (a.imageUrl ? 1 : 0)), 0);

  // RESTRICTED ACCESS SCREEN IF NOT UNLOCKED
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 inline-block">
              EXCLUSIV ADMIN • CODIN
            </span>
            <h2 className="text-xl font-black text-white">Manager Poze Carduri</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Acest tab este dedicat exclusiv încărcării rapide și organizării pozelor pentru toate cele {totalCards} carduri de activități.
            </p>
          </div>

          {/* Quick Codin Direct Auth */}
          <div className="pt-2">
            <button
              onClick={handleDirectCodinAuth}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition active:scale-95"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Sunt Codin (Autentificare Rapidă)</span>
            </button>
          </div>

          <div className="relative flex items-center gap-3 my-4">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-500">sau introduceți codul PIN</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* PIN Form */}
          <form onSubmit={handleUnlockPin} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password"
                placeholder="Cod PIN Admin (ex: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-cyan-400 focus:outline-none transition"
              />
            </div>
            {pinError && (
              <p className="text-xs font-bold text-rose-400">PIN incorect. Încearcă 1234 sau folosește butonul de mai sus.</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition"
            >
              Deblochează Tabul
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 pb-28 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border border-cyan-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-black shadow-lg">
              📸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white tracking-tight">Manager Poze Exclusiv</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  ADMIN MODE
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Încarcă și gestionează rapid 2-3 poze reale pentru fiecare din cele {totalCards} carduri.
              </p>
            </div>
          </div>

          <button
            onClick={handleBatchSaveAll}
            disabled={isBatchSaving}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition active:scale-95 disabled:opacity-50"
          >
            {isBatchSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Salvează Toate Modificările</span>
          </button>
        </div>

        {batchMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold text-center">
            {batchMessage}
          </div>
        )}

        {/* STATS BAR */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block">Total Carduri</span>
            <span className="text-base font-black text-white">{totalCards}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block">Carduri cu Galerică (2+ poze)</span>
            <span className="text-base font-black text-emerald-400">{cardsWithMultiplePhotos} / {totalCards}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 block">Total Poze Încarcate</span>
            <span className="text-base font-black text-cyan-300">{totalPhotosUploaded}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-3 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Caută card după titlu, regiune..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none transition"
            />
          </div>

          <button
            onClick={() => setFilterMissing(!filterMissing)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 whitespace-nowrap w-full sm:w-auto justify-center ${
              filterMissing 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Doar cele fără poze multiple</span>
          </button>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'Toate Cardurile' },
            { id: 'beach', label: '🏖️ Plaje' },
            { id: 'taverna', label: '🍷 Taverne' },
            { id: 'culture', label: '🏛️ Cultură' },
            { id: 'sunset', label: '🌅 Apus' },
            { id: 'hike', label: '🥾 Hike' },
            { id: 'hidden_gem', label: '💎 Gem-uri' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS LIST FOR PHOTO UPLOAD */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <p className="text-sm font-bold text-slate-400">Niciun card găsit cu filtrele selectate.</p>
          </div>
        ) : (
          filteredActivities.map((activity, idx) => {
            const imagesList = activity.images && activity.images.length > 0 
              ? activity.images 
              : [activity.imageUrl];

            const isSaved = savedSuccessId === activity.id;
            const isSaving = savingId === activity.id;

            return (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-4 shadow-xl transition relative overflow-hidden"
              >
                {/* TOP CARD HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-500">#{idx + 1}</span>
                      <h3 className="text-sm sm:text-base font-black text-white">{activity.title}</h3>
                      {activity.greekName && (
                        <span className="text-xs font-mono text-cyan-400/80">({activity.greekName})</span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                        {activity.region}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                      imagesList.length >= 2 
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      📸 {imagesList.length} {imagesList.length === 1 ? 'poză' : 'poze'}
                    </span>

                    <button
                      onClick={() => handleSaveActivity(activity)}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        isSaved
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30'
                      }`}
                    >
                      {isSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isSaved ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isSaved ? 'Salvat' : 'Salvează'}</span>
                    </button>
                  </div>
                </div>

                {/* CURRENT GALLERY THUMBNAILS */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    Poze Curente în Galerie (Prima este Poza de Copertă ⭐):
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagesList.map((imgUrl, iIdx) => {
                      const isCover = imgUrl === activity.imageUrl;

                      return (
                        <div 
                          key={iIdx} 
                          className={`relative group rounded-xl overflow-hidden border bg-slate-950 h-28 ${
                            isCover ? 'border-cyan-400 ring-2 ring-cyan-400/40' : 'border-slate-800'
                          }`}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Photo ${iIdx + 1}`} 
                            className="w-full h-full object-cover" 
                          />

                          {/* Cover badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-slate-950/90 text-cyan-300 text-[9px] font-black border border-cyan-400/40 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-cyan-300 text-cyan-300" /> Copertă
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition p-1">
                            {!isCover && (
                              <button
                                onClick={() => handleSetCover(activity.id, imgUrl)}
                                className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center gap-1 hover:bg-cyan-400 transition"
                                title="Setează ca poza principală de copertă"
                              >
                                <Star className="w-3 h-3 fill-slate-950" /> Copertă
                              </button>
                            )}

                            {imagesList.length > 1 && (
                              <button
                                onClick={() => handleRemoveImage(activity.id, imgUrl)}
                                className="p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white transition"
                                title="Șterge poza din galerie"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* QUICK PRESET BUTTON IF LESS THAN 3 IMAGES */}
                    {imagesList.length < 3 && (
                      <button
                        onClick={() => handleLoadPresets(activity.id, activity.title)}
                        className="h-28 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 flex flex-col items-center justify-center p-2 text-center transition group"
                      >
                        <Sparkles className="w-5 h-5 mb-1 group-hover:scale-110 transition" />
                        <span className="text-[10px] font-extrabold leading-tight">
                          ✨ Autofill 3 Poze Reale
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* UPLOAD CONTROLS FOR THIS CARD */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* MULTI-FILE SELECT / DRAG DROP */}
                  <label className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-cyan-400/60 bg-slate-950/50 hover:bg-slate-950 rounded-xl p-3 flex items-center justify-center gap-2 text-slate-300 hover:text-white transition group">
                    <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                    <span className="text-xs font-bold">📂 Selectează Poze din PC/Telefon</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(activity.id, e.target.files)}
                      className="hidden" 
                    />
                  </label>

                  {/* PASTE URL INPUT */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Lipeste URL imagine web..." 
                        value={urlInputs[activity.id] || ''} 
                        onChange={(e) => setUrlInputs(prev => ({ ...prev, [activity.id]: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none transition"
                      />
                    </div>
                    <button
                      onClick={() => handleAddUrl(activity.id)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      + URL
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
