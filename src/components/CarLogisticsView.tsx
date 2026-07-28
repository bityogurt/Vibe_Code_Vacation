import React, { useState } from 'react';
import { 
  Car, 
  Fuel, 
  ShieldAlert, 
  Euro
} from 'lucide-react';
import { RoomState } from '../types';

interface CarLogisticsViewProps {
  roomState: RoomState;
  onUpdateMemberCar: (memberId: string, car: 'Car 1' | 'Car 2') => void;
}

export const CarLogisticsView: React.FC<CarLogisticsViewProps> = ({
  roomState,
  onUpdateMemberCar
}) => {
  const [gasPricePerLiter, setGasPricePerLiter] = useState<number>(1.95);
  const [estimatedKmTotal, setEstimatedKmTotal] = useState<number>(380);

  const car1Members = roomState.members.filter(m => m.assignedCar === 'Car 1' || !m.assignedCar);
  const car2Members = roomState.members.filter(m => m.assignedCar === 'Car 2');

  const litersPerCar = (estimatedKmTotal / 100) * 7.5;
  const fuelCostPerCar = litersPerCar * gasPricePerLiter;
  const totalFuelBothCars = fuelCostPerCar * 2;
  const fuelCostPerPerson = totalFuelBothCars / Math.max(1, roomState.members.length);

  return (
    <div className="w-full space-y-4 pb-6">
      
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Logistică 2 Mașini</h2>
              <p className="text-[11px] text-slate-400">Echipaj, combustibil și ghid de parcare</p>
            </div>
          </div>

          <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Benzină / Pers</span>
            <span className="text-xs font-black text-amber-400">~{Math.round(fuelCostPerPerson)}€</span>
          </div>
        </div>
      </div>

      {/* CAR CARDS */}
      <div className="space-y-3">
        {/* CAR 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                🚗1
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Mașina 1</h3>
                <p className="text-[10px] text-slate-400">{car1Members.length} pasageri</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-slate-800">
              ~{Math.round(fuelCostPerCar)}€ Benzină
            </span>
          </div>

          <div className="space-y-1.5">
            {car1Members.length > 0 ? (
              car1Members.map(member => (
                <div 
                  key={member.id}
                  className="p-2.5 rounded-2xl bg-slate-950 border border-sky-500/30 text-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${member.avatarColor}`} />
                    <span className="font-bold text-xs">{member.name}</span>
                    {member.id === 'm1' && (
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded-md text-sky-400 font-medium border border-sky-500/20">
                        Șofer
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onUpdateMemberCar(member.id, 'Car 2')}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition border border-slate-700 flex items-center gap-1"
                  >
                    Mută în 🚙 Mașina 2
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center">Niciun pasager în Mașina 1.</p>
            )}
          </div>
        </div>

        {/* CAR 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                🚙2
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Mașina 2</h3>
                <p className="text-[10px] text-slate-400">{car2Members.length} pasageri</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-slate-800">
              ~{Math.round(fuelCostPerCar)}€ Benzină
            </span>
          </div>

          <div className="space-y-1.5">
            {car2Members.length > 0 ? (
              car2Members.map(member => (
                <div 
                  key={member.id}
                  className="p-2.5 rounded-2xl bg-slate-950 border border-indigo-500/30 text-white flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${member.avatarColor}`} />
                    <span className="font-bold text-xs">{member.name}</span>
                    {member.id === 'm3' && (
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded-md text-indigo-400 font-medium border border-indigo-500/20">
                        Șofer
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onUpdateMemberCar(member.id, 'Car 1')}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition border border-slate-700 flex items-center gap-1"
                  >
                    Mută în 🚗 Mașina 1
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center">Niciun pasager în Mașina 2 încă.</p>
            )}
          </div>
        </div>
      </div>

      {/* FUEL CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Fuel className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">Calculator Combustibil (2 Mașini)</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-slate-400 text-[10px] font-medium block mb-1">Km Totali per Mașină</label>
            <input 
              type="number" 
              value={estimatedKmTotal} 
              onChange={(e) => setEstimatedKmTotal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 font-bold focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] font-medium block mb-1">Preț Benzină (€/L)</label>
            <input 
              type="number" 
              step="0.05"
              value={gasPricePerLiter} 
              onChange={(e) => setGasPricePerLiter(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2 font-bold focus:outline-none text-xs"
            />
          </div>
        </div>
      </div>

      {/* PARKING TIPS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 shadow-lg">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">Ghid Parcare 2 Mașini în Kefalonia</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-300 block mb-0.5">🏖️ Plaja Myrtos</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Ajungeți înainte de ora 10:30! Parcare mare jos, dar se umple repede.
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-300 block mb-0.5">🏰 Satul Assos</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Lăsați ambele mașini la intrarea de sus pe marginea drumului principal.
            </p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-300 block mb-0.5">🏡 Villa Louke</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Parcare privată umbrită gratuită pentru ambele mașini la cazare.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
