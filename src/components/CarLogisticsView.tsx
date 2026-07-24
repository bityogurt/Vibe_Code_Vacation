import React, { useState } from 'react';
import { 
  Car, 
  Users, 
  MapPin, 
  Fuel, 
  ShieldAlert, 
  Euro, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Navigation 
} from 'lucide-react';
import { RoomState, UserProfile, DayItinerary } from '../types';

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

  // Group members by car
  const car1Members = roomState.members.filter(m => m.assignedCar === 'Car 1' || !m.assignedCar);
  const car2Members = roomState.members.filter(m => m.assignedCar === 'Car 2');

  // Calculate estimated total fuel cost for 2 cars
  // Avg consumption: 7.5L / 100km per car
  const litersPerCar = (estimatedKmTotal / 100) * 7.5;
  const fuelCostPerCar = litersPerCar * gasPricePerLiter;
  const totalFuelBothCars = fuelCostPerCar * 2;
  const fuelCostPerPerson = totalFuelBothCars / Math.max(1, roomState.members.length);

  // Calculate activities budget total across locked days
  let totalActivitiesBudgetGroup = 0;
  (Object.values(roomState.itineraries || {}) as DayItinerary[]).forEach(day => {
    (day.activityIds || []).forEach(actId => {
      const act = roomState.activities.find(a => a.id === actId);
      if (act) totalActivitiesBudgetGroup += act.costPerPerson * 5;
    });
  });

  const totalActivitiesBudgetPerPerson = totalActivitiesBudgetGroup / 5;
  const totalProjectedTripBudgetPerPerson = totalActivitiesBudgetPerPerson + fuelCostPerPerson + (25 * 7); // +25€/day meal allowance

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Echipaj 2 Mașini & Buget Convoi
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Organizați cele 2 mașini pentru drumul din Kefalonia, calculați benzinăria la comun și citiți sfaturile de parcare pentru Villa Louke.
          </p>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right shrink-0">
          <div className="text-[10px] text-slate-400 font-medium">Buget Estimat Total/Persoană</div>
          <div className="text-base font-black text-emerald-400">
            ~{Math.round(totalProjectedTripBudgetPerPerson)}€ <span className="text-[10px] text-slate-400 font-normal">(Activități + Combustibil + Masă)</span>
          </div>
        </div>
      </div>

      {/* CAR ASSIGNMENT BOARD (CAR 1 vs CAR 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CAR 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                🚗1
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Mașina 1 (Convoi Sud/Nord)</h3>
                <p className="text-xs text-slate-400">{car1Members.length} pasageri asignați</p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ~{Math.round(fuelCostPerCar)}€ Benzină
            </span>
          </div>

          {/* Members List in Car 1 */}
          <div className="space-y-2">
            {roomState.members.map(member => {
              const isAssignedToCar1 = (member.assignedCar === 'Car 1' || !member.assignedCar);

              return (
                <div 
                  key={member.id}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    isAssignedToCar1 
                      ? 'bg-slate-950 border-amber-500/40 text-white' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${member.avatarColor}`} />
                    <span className="font-semibold text-xs">{member.name}</span>
                    {member.id === 'm1' && <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">Șofer</span>}
                  </div>

                  <button
                    onClick={() => onUpdateMemberCar(member.id, isAssignedToCar1 ? 'Car 2' : 'Car 1')}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {isAssignedToCar1 ? 'Mută în Mașina 2' : 'Mută în Mașina 1'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CAR 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                🚙2
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Mașina 2 (Convoi Sud/Nord)</h3>
                <p className="text-xs text-slate-400">{car2Members.length} pasageri asignați</p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ~{Math.round(fuelCostPerCar)}€ Benzină
            </span>
          </div>

          {/* Members List in Car 2 */}
          <div className="space-y-2">
            {car2Members.length > 0 ? (
              car2Members.map(member => (
                <div 
                  key={member.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full ${member.avatarColor}`} />
                    <span className="font-semibold text-xs">{member.name}</span>
                    {member.id === 'm3' && <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">Șofer</span>}
                  </div>

                  <button
                    onClick={() => onUpdateMemberCar(member.id, 'Car 1')}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    Mută în Mașina 1
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center">Niciun pasager asignat în Mașina 2 încă.</p>
            )}
          </div>
        </div>

      </div>

      {/* FUEL & MILEAGE CALCULATOR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Fuel className="w-5 h-5 text-rose-400" />
          <h3 className="font-bold text-white text-base">Calculator Combustibil Comun (2 Mașini)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Km Totali Estimați per Mașină</label>
            <input 
              type="number" 
              value={estimatedKmTotal} 
              onChange={(e) => setEstimatedKmTotal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Preț Benzină (€/Litru în Grecia)</label>
            <input 
              type="number" 
              step="0.05"
              value={gasPricePerLiter} 
              onChange={(e) => setGasPricePerLiter(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold focus:outline-none"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
            <span className="text-slate-400 font-medium">Cost Benzină / Persoană</span>
            <span className="text-lg font-black text-amber-400">
              ~{Math.round(fuelCostPerPerson)} € <span className="text-[10px] text-slate-400 font-normal">({Math.round(totalFuelBothCars)}€ ambele mașini)</span>
            </span>
          </div>
        </div>
      </div>

      {/* PARKING & DRIVING SURVIVAL GUIDE FOR KEFALONIA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">Ghid Supraviețuire Parcare 2 Mașini în Kefalonia</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300">🏖️ Plaja Myrtos cu 2 Mașini</div>
            <p className="text-slate-300 leading-relaxed">
              Ajungeți înainte de ora 10:30! Drumul șerpuiește spre bază. Dacă parcarea de jos e plină, va trebui să parcați pe marginea drumului îngust și să coborâți pe jos.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300">🏰 Satul Assos & Străduțe Înguste</div>
            <p className="text-slate-300 leading-relaxed">
              Nu intrați cu mașinile în centrul istoric pietonal din Assos! Lăsați ambele mașini la intrarea de sus pe marginea drumului principal.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300">⚓ Portul Argostoli & Faleză</div>
            <p className="text-slate-300 leading-relaxed">
              Lângă portul de ferry și podul De Bosset există o parcare imensă gratuită neasfaltată. Perfectă pentru a lăsa ambele mașini laolaltă.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-300">🏡 Villa Louke (Cazare Base)</div>
            <p className="text-slate-300 leading-relaxed">
              Vila oferă spațiu generos de parcare privată umbrită pentru 2 sau 3 vehicule. Foarte ușor de încărcat bagaje și cumpărături.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
