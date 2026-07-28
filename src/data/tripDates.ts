import { DayItinerary } from '../types';

export const TRIP_DAYS: DayItinerary[] = [
  {
    date: '2026-09-20',
    dayNumber: 1,
    dayName: 'Duminică, 20 Septembrie',
    theme: 'Sosire & Relaxare la Villa Louke + Plajă Sud',
    activityIds: [],
    notes: 'Check-in la Villa Louke, cumpărături de bază, prima baie în mare.'
  },
  {
    date: '2026-09-21',
    dayNumber: 2,
    dayName: 'Luni, 21 Septembrie',
    theme: 'Sălbaticul Nord: Assos Peninsula & Plaja Myrtos',
    activityIds: [],
    notes: 'Drum pitoresc spre nord cu 2 mașini. Apus spectaculos.'
  },
  {
    date: '2026-09-22',
    dayNumber: 3,
    dayName: 'Marți, 22 Septembrie',
    theme: 'Lumea Subterană & Sami: Peștera Melissani & Antisamos',
    activityIds: [],
    notes: 'Plimbare cu barca pe lacul subteran + prânz cu pește proaspăt.'
  },
  {
    date: '2026-09-23',
    dayNumber: 4,
    dayName: 'Miercuri, 23 Septembrie',
    theme: 'Peninsula Paliki & Nisipul Roșu de la Xi Beach',
    activityIds: [],
    notes: 'Trecere cu ferry din Argostoli la Lixouri sau drum scenic în jurul golfului.'
  },
  {
    date: '2026-09-24',
    dayNumber: 5,
    dayName: 'Joi, 24 Septembrie',
    theme: 'Muntele Ainos & Cramele de Robola',
    activityIds: [],
    notes: 'Hike de dimineață la 1628m + degustare de vin local grecesc.'
  },
  {
    date: '2026-09-25',
    dayNumber: 6,
    dayName: 'Vineri, 25 Septembrie',
    theme: 'Luxul din Fiskardo & Golfeurile Ascunse (Foki & Kimilia)',
    activityIds: [],
    notes: 'Snorkeling, yahturi, taverne gourmet la preț bun și plaje idilice.'
  },
  {
    date: '2026-09-26',
    dayNumber: 7,
    dayName: 'Sâmbătă, 26 Septembrie',
    theme: 'Argostoli Promenade, Țestoasele Caretta-Caretta & Suveniruri',
    activityIds: [],
    notes: 'Ultima zi! Cafea pe faleză, vizionare țestoase gigante și cină de rămas bun.'
  }
];

export const DEFAULT_MEMBERS = [
  { id: 'm1', name: 'Robi', avatarColor: 'bg-emerald-500', assignedCar: 'Car 1' as const },
  { id: 'm2', name: 'Raul', avatarColor: 'bg-indigo-500', assignedCar: 'Car 1' as const },
  { id: 'm3', name: 'Codin', avatarColor: 'bg-cyan-500', assignedCar: 'Car 2' as const },
  { id: 'm4', name: 'Bolovan', avatarColor: 'bg-amber-500', assignedCar: 'Car 2' as const },
  { id: 'm5', name: 'Stefan', avatarColor: 'bg-sky-500', assignedCar: 'Car 1' as const },
];

export function getMaxUnlockedVotingDay(): { maxDayNumber: number; explanationText: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // If date is before or on 19 September 2026 (or any date prior to trip start)
  if (year < 2026 || (year === 2026 && month < 9) || (year === 2026 && month === 9 && day <= 19)) {
    return {
      maxDayNumber: 1,
      explanationText: 'Până pe 19 Septembrie: Vot deschis pentru Ziua 1 (20 Septembrie).'
    };
  }

  if (year === 2026 && month === 9) {
    if (day === 20) return { maxDayNumber: 2, explanationText: '20 Septembrie: Vot deschis pentru Ziua 2 (21 Septembrie).' };
    if (day === 21) return { maxDayNumber: 3, explanationText: '21 Septembrie: Vot deschis pentru Ziua 3 (22 Septembrie).' };
    if (day === 22) return { maxDayNumber: 4, explanationText: '22 Septembrie: Vot deschis pentru Ziua 4 (23 Septembrie).' };
    if (day === 23) return { maxDayNumber: 5, explanationText: '23 Septembrie: Vot deschis pentru Ziua 5 (24 Septembrie).' };
    if (day === 24) return { maxDayNumber: 6, explanationText: '24 Septembrie: Vot deschis pentru Ziua 6 (25 Septembrie).' };
    if (day >= 25) return { maxDayNumber: 7, explanationText: '25-26 Septembrie: Toate zilele au vot deschis.' };
  }

  return { maxDayNumber: 7, explanationText: 'Toate zilele au vot deschis.' };
}


