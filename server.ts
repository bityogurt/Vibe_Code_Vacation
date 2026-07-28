import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_ACTIVITIES } from './src/data/kefaloniaActivities.js';
import { TRIP_DAYS, DEFAULT_MEMBERS } from './src/data/tripDates.js';
import { RoomState, Vote, Activity, DayItinerary } from './src/types.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory store for rooms
const roomsStore: Record<string, RoomState> = {};

// Helper to get or create room
function getOrCreateRoom(roomIdInput: string): RoomState {
  const roomId = (roomIdInput || 'VILLA-LOUKE').toUpperCase().trim();
  if (!roomsStore[roomId]) {
    const itinerariesMap: Record<number, DayItinerary> = {};
    TRIP_DAYS.forEach(day => {
      itinerariesMap[day.dayNumber] = { ...day, activityIds: [] };
    });

    roomsStore[roomId] = {
      roomId,
      roomName: roomId === 'VILLA-LOUKE' ? 'Villa Louke - Kefalonia 2026' : `Grup ${roomId}`,
      members: DEFAULT_MEMBERS,
      votes: {},
      activities: [...INITIAL_ACTIVITIES],
      itineraries: itinerariesMap,
      createdAt: Date.now()
    };
  }
  return roomsStore[roomId];
}

// Pre-initialize default room
getOrCreateRoom('VILLA-LOUKE');

// --- API ENDPOINTS ---

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get room state
app.get('/api/rooms/:roomId', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json({ success: true, room });
});

// Join or update member profile in room
app.post('/api/rooms/:roomId/join', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { userProfile } = req.body;
  
  if (!userProfile || !userProfile.id || !userProfile.name) {
    return res.status(400).json({ error: 'Profil invalid' });
  }

  const existingIdx = room.members.findIndex(m => m.id === userProfile.id);
  if (existingIdx >= 0) {
    room.members[existingIdx] = { ...room.members[existingIdx], ...userProfile };
  } else {
    room.members.push(userProfile);
  }

  res.json({ success: true, room });
});

// Submit vote (swipe)
app.post('/api/rooms/:roomId/vote', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { userId, activityId, vote } = req.body;

  if (!userId || !activityId || !vote) {
    return res.status(400).json({ error: 'Parametri incompleți pentru vot' });
  }

  const key = `${userId}_${activityId}`;
  room.votes[key] = {
    userId,
    activityId,
    vote,
    timestamp: Date.now()
  };

  res.json({ success: true, room });
});

// Add custom activity to card deck
app.post('/api/rooms/:roomId/add-activity', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { activity } = req.body;

  if (!activity || !activity.title) {
    return res.status(400).json({ error: 'Activitate invalidă' });
  }

  const newActivity: Activity = {
    ...activity,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    isCustom: true
  };

  room.activities.push(newActivity);
  res.json({ success: true, room, newActivity });
});

// Lock activities into a day's itinerary
app.post('/api/rooms/:roomId/lock-day', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { dayNumber, activityIds } = req.body;

  if (!dayNumber || !Array.isArray(activityIds)) {
    return res.status(400).json({ error: 'Date invalide pentru itinerar' });
  }

  if (!room.itineraries[dayNumber]) {
    return res.status(404).json({ error: 'Ziua nu există' });
  }

  room.itineraries[dayNumber].activityIds = activityIds;
  res.json({ success: true, room });
});

// Unlock day itinerary
app.post('/api/rooms/:roomId/unlock-day', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { dayNumber } = req.body;

  if (room.itineraries[dayNumber]) {
    room.itineraries[dayNumber].activityIds = [];
  }

  res.json({ success: true, room });
});

// Reset swipes
app.post('/api/rooms/:roomId/reset-votes', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const { userId } = req.body;

  if (userId) {
    // Reset for specific user
    Object.keys(room.votes).forEach(key => {
      if (key.startsWith(`${userId}_`)) {
        delete room.votes[key];
      }
    });
  } else {
    // Reset all votes in room
    room.votes = {};
  }

  res.json({ success: true, room });
});

// --- AI KEFALONIA ADVISOR (Gemini API) ---
app.post('/api/ai/advisor', async (req, res) => {
  try {
    const { prompt, lockedItineraries, roomMembers } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Cheia GEMINI_API_KEY nu este configurată.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Ești un asistent de călătorie expert în insula Kefalonia, Grecia.
Grupul este format din 5 persoane, au 2 mașini și sunt cazați la Villa Louke (zona Livatho/Spartia) între 20 și 26 Septembrie 2026.
Răspunde în limba română prietenos, concis și util cu sfaturi logistice exacte (timp de condus, parcare pentru 2 mașini, bugete reduse, recomandări de mâncare și plaje ascunse).
Context curent itinerar: ${JSON.stringify(lockedItineraries || {})}
Membri: 5 persoane cu 2 mașini.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nÎntrebare utilizator: ${prompt}` }] }
      ]
    });

    const replyText = response.text || 'Nu am putut genera un răspuns în acest moment.';
    res.json({ success: true, reply: replyText });

  } catch (error: any) {
    console.error('Eroare Gemini AI:', error);
    res.status(500).json({ error: error.message || 'Eroare la procesarea cererii AI.' });
  }
});


// --- VITE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Kefalonia Match pornit pe portul ${PORT}`);
  });
}

startServer();
