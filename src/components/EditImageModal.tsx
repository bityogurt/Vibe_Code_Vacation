import React, { useState } from 'react';
import { Image, Upload, Link, Check, X, Sparkles, RefreshCw } from 'lucide-react';
import { Activity } from '../types';

interface EditImageModalProps {
  activity: Activity | null;
  onClose: () => void;
  onSaveImage: (activityId: string, newImageUrl: string) => void;
}

// Curated high quality Kefalonia preset photos for quick selection
const PRESET_PHOTOS = [
  { name: 'Myrtos Beach Turcoaz', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Peștera Melissani', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Fiscardo Port Venețian', url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Assos Castel & Golfeț', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Plaja Xi Nisip Roșu', url: 'https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Tavernă Grecească Mure', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Apus de Soare Dramatic', url: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Croazieră / Barcă privată', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80' },
  { name: 'Muntele Ainos & Natură', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80' }
];

export const EditImageModal: React.FC<EditImageModalProps> = ({
  activity,
  onClose,
  onSaveImage
}) => {
  if (!activity) return null;

  const [imageUrl, setImageUrl] = useState<string>(activity.imageUrl || '');
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'presets'>('url');
  const [imageError, setImageError] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Imaginea este prea mare! Alege o imagine sub 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setImageError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!imageUrl.trim()) {
      alert('Introdu un URL sau selectează o imagine!');
      return;
    }
    onSaveImage(activity.id, imageUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">Schimbă Poza Cardului</h3>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{activity.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
              <Image className="w-8 h-8 opacity-40" />
              <span className="text-xs font-medium">
                {imageError ? '❌ URL-ul imaginii nu a putut fi încărcat' : 'Inserează un URL sau alege o poză'}
              </span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 font-mono border border-slate-700">
            Preview Imagine Reală
          </span>
        </div>

        {/* Option Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('url'); setImageError(false); }}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'url' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Link URL</span>
          </button>

          <button
            onClick={() => { setActiveTab('upload'); setImageError(false); }}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'upload' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Fișier</span>
          </button>

          <button
            onClick={() => { setActiveTab('presets'); setImageError(false); }}
            className={`py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'presets' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Galerie</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 py-1 pr-1 custom-scrollbar">
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Lipește adresa URL directă a imaginii (Google Images / Unsplash):
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-2xl p-3 focus:outline-none focus:border-sky-500 transition"
              />
              <p className="text-[10px] text-slate-500">
                💡 Sfat: Pe Google Images, dă Click Dreapta pe poză &rarr; "Copy Image Address" / "Copiază adresa imaginii".
              </p>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Încarcă o poză din telefon sau calculator:
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-4 cursor-pointer bg-slate-950/50 transition">
                <Upload className="w-6 h-6 text-sky-400 mb-1" />
                <span className="text-xs font-bold text-white">Selectează Poza</span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Alege o imagine din colecția Kefalonia:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setImageError(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 h-20 group transition ${
                      imageUrl === preset.url ? 'border-sky-400 ring-2 ring-sky-400/30' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-transparent transition" />
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white truncate bg-slate-950/80 px-1 py-0.5 rounded backdrop-blur-md">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Salvează Imaginea</span>
          </button>
        </div>

      </div>
    </div>
  );
};
