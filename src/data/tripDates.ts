import { DayItinerary } from '../types';

export const TRIP_DAYS: DayItinerary[] = [
  {
    date: '2026-07-20',
    dayNumber: 1,
    dayName: 'Duminică, 20 Iulie',
    theme: 'Sosire & Relaxare la Villa Louke + Plajă Sud',
    activityIds: [],
    notes: 'Check-in la Villa Louke, cumpărături de bază, prima baie în mare.'
  },
  {
    date: '2026-07-21',
    dayNumber: 2,
    dayName: 'Luni, 21 Iulie',
    theme: 'Sălbaticul Nord: Assos Peninsula & Plaja Myrtos',
    activityIds: [],
    notes: 'Drum pitoresc spre nord cu 2 mașini. Apus spectaculos.'
  },
  {
    date: '2026-07-22',
    dayNumber: 3,
    dayName: 'Marți, 22 Iulie',
    theme: 'Lumea Subterană & Sami: Peștera Melissani & Antisamos',
    activityIds: [],
    notes: 'Plimbare cu barca pe lacul subteran + prânz cu pește proaspăt.'
  },
  {
    date: '2026-07-23',
    dayNumber: 4,
    dayName: 'Miercuri, 23 Iulie',
    theme: 'Peninsula Paliki & Nisipul Roșu de la Xi Beach',
    activityIds: [],
    notes: 'Trecere cu ferry din Argostoli la Lixouri sau drum scenic în jurul golfului.'
  },
  {
    date: '2026-07-24',
    dayNumber: 5,
    dayName: 'Joi, 24 Iulie',
    theme: 'Muntele Ainos & Cramele de Robola',
    activityIds: [],
    notes: 'Hike de dimineață la 1628m + degustare de vin local grecesc.'
  },
  {
    date: '2026-07-25',
    dayNumber: 6,
    dayName: 'Vineri, 25 Iulie',
    theme: 'Luxul din Fiskardo & Golfeurile Ascunse (Foki & Kimilia)',
    activityIds: [],
    notes: 'Snorkeling, yahturi, taverne gourmet la preț bun și plaje idilice.'
  },
  {
    date: '2026-07-26',
    dayNumber: 7,
    dayName: 'Sâmbătă, 26 Iulie',
    theme: 'Argostoli Promenade, Țestoasele Caretta-Caretta & Suveniruri',
    activityIds: [],
    notes: 'Ultima zi! Cafea pe faleză, vizionare țestoase gigante și cină de rămas bun.'
  }
];

export const DEFAULT_MEMBERS = [
  { id: 'm1', name: 'Robi', avatarColor: 'bg-emerald-500', assignedCar: 'Car 1' as const },
  { id: 'm2', name: 'Raul', avatarColor: 'bg-rose-500', assignedCar: 'Car 1' as const },
  { id: 'm3', name: 'Codin', avatarColor: 'bg-indigo-500', assignedCar: 'Car 2' as const },
  { id: 'm4', name: 'Bolovan', avatarColor: 'bg-amber-500', assignedCar: 'Car 2' as const },
  { id: 'm5', name: 'Coleg Raul', avatarColor: 'bg-cyan-500', assignedCar: 'Car 1' as const },
];
