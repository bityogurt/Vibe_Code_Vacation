export type ActivityCategory = 
  | 'beach' 
  | 'hike' 
  | 'taverna' 
  | 'culture' 
  | 'sunset' 
  | 'hidden_gem' 
  | 'boat_tour';

export type KefaloniaRegion = 
  | 'North (Fiskardo/Assos)' 
  | 'South (Livatho/Lourdas)' 
  | 'East (Sami/Antisamos)' 
  | 'West (Paliki/Lixouri)' 
  | 'Central (Argostoli/Ainos)';

export type VoteType = 'like' | 'dislike' | 'superlike';

export interface Activity {
  id: string;
  title: string;
  greekName?: string;
  category: ActivityCategory;
  region: KefaloniaRegion;
  costPerPerson: number; // in Euros (€)
  estimatedDuration: string; // e.g., "2-3 hours", "Half Day"
  distanceFromVillaLouke: string; // e.g. "15 mins drive", "45 mins drive"
  carParkingDifficulty: 'Easy' | 'Moderate' | 'Challenging';
  carLogisticsNote: string;
  description: string;
  tags: string[];
  imageUrl: string;
  highlights: string[];
  bestTimeOfDay: 'Morning' | 'Afternoon' | 'Late Afternoon' | 'Lunchtime' | 'Sunset' | 'Evening' | 'Anytime';
  isCustom?: boolean;
  createdBy?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string; // Tailwind bg color class or hex
  assignedCar?: 'Car 1' | 'Car 2';
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface Vote {
  userId: string;
  activityId: string;
  vote: VoteType;
  timestamp: number;
}

export interface DayItinerary {
  date: string; // e.g., "2026-07-20"
  dayNumber: number; // 1 to 7
  dayName: string; // e.g., "Sunday, July 20"
  theme: string; // e.g., "South Coast & Arrival Chill"
  activityIds: string[]; // 3-4 activity IDs locked for this day
  timeSlots?: { [activityId: string]: string }; // e.g., "10:00 AM - 1:00 PM"
  notes?: string;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  members: UserProfile[];
  votes: Record<string, Vote>; // Key: `${userId}_${activityId}`
  activities: Activity[];
  itineraries: Record<number, DayItinerary>; // Key: dayNumber (1..7)
  createdAt: number;
}

export interface CarLogistics {
  car1: {
    driver: string;
    passengers: string[];
    carModel: string;
  };
  car2: {
    driver: string;
    passengers: string[];
    carModel: string;
  };
  estimatedFuelBudget: number;
}
