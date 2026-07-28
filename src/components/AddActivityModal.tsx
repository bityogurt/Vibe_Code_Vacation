import React, { useState } from 'react';
import { X, PlusCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { ActivityCategory, KefaloniaRegion } from '../types';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activityData: any) => void;
  currentUserName: string;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  currentUserName
}) => {
  const [title, setTitle] = useState('');
  const [greekName, setGreekName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('beach');
  const [region, setRegion] = useState<KefaloniaRegion>('South (Livatho/Lourdas)');
  const [costPerPerson, setCostPerPerson] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState('2-3 ore');
  const [distanceFromVillaLouke, setDistanceFromVillaLouke] = useState('20 mins drive');
  const [description, setDescription] = useState('');
  const [carLogisticsNote, setCarLogisticsNote] = useState('Parcare ușoară pentru ambele mașini.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Te rugăm să introduci titlul și descrierea!');
      return;
    }

    onAddActivity({
      title: title.trim(),
      greekName: greekName.trim() || undefined,
      category,
      region,
      costPerPerson: Number(costPerPerson),
      estimatedDuration,
      distanceFromVillaLouke,
      carParkingDifficulty: 'Moderate',
      carLogisticsNote,
      description: description.trim(),
      tags: ['Grup Idea', 'Personalizat'],
      imageUrl: imageUrl.trim(),
      highlights: ['Propusă de ' + currentUserName, 'Votare deschisă în pachet'],
      bestTimeOfDay: 'Afternoon',
      createdBy: currentUserName
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-white/15 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Adaugă Idee Nouă</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Titlu Activitate / Plajă / Restaurant *</label>
            <input
              type="text"
              required
              placeholder="ex: Taverna Spiros"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 text-white rounded-xl p-2.5 focus:outline-none"
            />
          </div>

          {/* Image Upload & URL Section */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Imagine Card *</label>
            
            {imageUrl && (
              <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-white/15 shadow-inner bg-slate-950">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] text-cyan-300 border border-white/10">
                  Aperçu Imagine
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 font-bold rounded-xl cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Încarcă din telefon</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="sau lipește un URL imagine (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 text-white text-[11px] rounded-xl p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Categorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-2 focus:outline-none"
              >
                <option value="beach">🏖️ Plajă</option>
                <option value="hidden_gem">💎 Perlă</option>
                <option value="hike">🥾 Hike</option>
                <option value="taverna">🍲 Tavernă</option>
                <option value="culture">🏛️ Cultură</option>
                <option value="sunset">🌅 Apus</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Regiune</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-2 focus:outline-none"
              >
                <option value="South (Livatho/Lourdas)">Sud (Lângă Vila)</option>
                <option value="North (Fiskardo/Assos)">Nord (Assos)</option>
                <option value="West (Paliki/Lixouri)">Vest (Paliki)</option>
                <option value="East (Sami/Antisamos)">Est (Sami)</option>
                <option value="Central (Argostoli/Ainos)">Centru (Argostoli)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Cost (€ / Persoană)</label>
              <input
                type="number"
                value={costPerPerson}
                onChange={(e) => setCostPerPerson(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Distanță Vila</label>
              <input
                type="text"
                value={distanceFromVillaLouke}
                onChange={(e) => setDistanceFromVillaLouke(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Descriere *</label>
            <textarea
              required
              rows={2}
              placeholder="De ce merită mers?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-2 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/10 text-slate-300 font-semibold border border-white/10"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold rounded-xl shadow border border-white/20"
            >
              Adaugă Card
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

