import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SwipeDeck } from './components/SwipeDeck';
import { ConsensusView } from './components/ConsensusView';
import { ItineraryView } from './components/ItineraryView';
import { CarLogisticsView } from './components/CarLogisticsView';
import { AiAssistant } from './components/AiAssistant';
import { AddActivityModal } from './components/AddActivityModal';
import { UserSelectionModal } from './components/UserSelectionModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RoomState, UserProfile, VoteType, Activity } from './types';
import { INITIAL_ACTIVITIES } from './data/kefaloniaActivities';
import { TRIP_DAYS, DEFAULT_MEMBERS } from './data/tripDates';

export default function App() {
  const [roomId, setRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || 'VILLA-LOUKE').toUpperCase();
  });

  const [activeTab, setActiveTab] = useState<'swipe' | 'consensus' | 'itinerary' | 'cars' | 'ai'>('swipe');
  
  const validMemberNames = DEFAULT_MEMBERS.map(m => m.name);

  // Current user selection
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('kefalonia_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (validMemberNames.includes(parsed.name)) {
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_MEMBERS[0];
  });

  // Track if user explicitly selected a profile
  const [hasChosenUser, setHasChosenUser] = useState<boolean>(() => {
    const saved = localStorage.getItem('kefalonia_user');
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      if (!validMemberNames.includes(parsed.name)) return false;
    } catch (e) {
      return false;
    }
    return localStorage.getItem('kefalonia_user_chosen') === 'true';
  });

  // Active voting target day (e.g. Day 1, Day 2, Day 3)
  const [activeVotingDay, setActiveVotingDay] = useState<number>(() => {
    const saved = localStorage.getItem('kefalonia_active_voting_day');
    return saved ? parseInt(saved) : 1;
  });

  // Room state
  const [roomState, setRoomState] = useState<RoomState>({
    roomId,
    roomName: 'Villa Louke - Kefalonia 2026',
    members: DEFAULT_MEMBERS,
    votes: {},
    activities: INITIAL_ACTIVITIES,
    itineraries: TRIP_DAYS.reduce((acc, day) => {
      acc[day.dayNumber] = { ...day, activityIds: [] };
      return acc;
    }, {} as Record<number, any>),
    createdAt: Date.now()
  });

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Fetch room state from backend API
  const fetchRoomState = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.success && data.room) {
        setRoomState(data.room);
      }
    } catch (e) {
      console.warn('Eroare conectare server camera:', e);
    }
  }, [roomId]);

  // Initial fetch + interval poll for real-time multi-device phone voting
  useEffect(() => {
    fetchRoomState();
    const interval = setInterval(fetchRoomState, 2500);
    return () => clearInterval(interval);
  }, [fetchRoomState]);

  // Auto join user to room
  useEffect(() => {
    if (currentUser && roomId) {
      fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: currentUser })
      }).catch(() => {});
    }
  }, [currentUser, roomId]);

  // Save current user to localStorage
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setHasChosenUser(true);
    localStorage.setItem('kefalonia_user', JSON.stringify(user));
    localStorage.setItem('kefalonia_user_chosen', 'true');
  };

  // Lock Top 3 highest agreed activities for target day
  const handleLockTop3ToDay = async (targetDay: number) => {
    // Collect all locked activity IDs across days
    const lockedSet = new Set<string>();
    Object.values(roomState.itineraries || {}).forEach((day: any) => {
      (day.activityIds || []).forEach((id: string) => lockedSet.add(id));
    });

    // Score all available unassigned activities based on votes of all 5 members
    const unassigned = roomState.activities.filter(a => !lockedSet.has(a.id));

    const scored = unassigned.map(act => {
      let likes = 0;
      let superlikes = 0;
      let dislikes = 0;

      roomState.members.forEach(member => {
        const key = `${member.id}_${act.id}`;
        const v = roomState.votes[key];
        if (v) {
          if (v.vote === 'like') likes++;
          else if (v.vote === 'superlike') superlikes++;
          else if (v.vote === 'dislike') dislikes++;
        }
      });

      const score = (likes * 1) + (superlikes * 2) - (dislikes * 1);
      return { activityId: act.id, score, likes, superlikes };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score || b.superlikes - a.superlikes || b.likes - a.likes);

    // Pick top 3
    const top3Ids = scored.slice(0, 3).map(s => s.activityId);

    if (top3Ids.length === 0) {
      alert('Nu există suficiente activități neasociate în pool!');
      return;
    }

    // Merge with existing day activities
    const currentDayActs = roomState.itineraries[targetDay]?.activityIds || [];
    const updatedIds = Array.from(new Set([...currentDayActs, ...top3Ids]));

    // Update local state
    setRoomState(prev => ({
      ...prev,
      itineraries: {
        ...prev.itineraries,
        [targetDay]: {
          ...prev.itineraries[targetDay],
          activityIds: updatedIds
        }
      }
    }));

    // Send to backend API
    try {
      await fetch(`/api/rooms/${roomId}/lock-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber: targetDay, activityIds: updatedIds })
      });
    } catch (e) {
      console.error('Eroare la salvarea itinerarului Top 3:', e);
    }

    // Advance active voting day if possible
    if (targetDay < TRIP_DAYS.length) {
      const nextDay = targetDay + 1;
      setActiveVotingDay(nextDay);
      localStorage.setItem('kefalonia_active_voting_day', String(nextDay));
    }
  };

  // Submit vote (swipe right/left/up)
  const handleVote = async (activityId: string, voteType: VoteType) => {
    // Optimistic local state update
    const voteKey = `${currentUser.id}_${activityId}`;
    setRoomState(prev => ({
      ...prev,
      votes: {
        ...prev.votes,
        [voteKey]: {
          userId: currentUser.id,
          activityId,
          vote: voteType,
          timestamp: Date.now()
        }
      }
    }));

    // Send to API
    try {
      await fetch(`/api/rooms/${roomId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          activityId,
          vote: voteType
        })
      });
    } catch (e) {
      console.error('Eroare la trimiterea votului:', e);
    }
  };

  // Undo last vote for current user
  const handleUndoLastVote = async () => {
    // Find last vote by currentUser
    const userVoteKeys = Object.keys(roomState.votes).filter(k => k.startsWith(`${currentUser.id}_`));
    if (userVoteKeys.length === 0) return;

    // Sort by timestamp descending
    const lastKey = userVoteKeys.sort((a, b) => roomState.votes[b].timestamp - roomState.votes[a].timestamp)[0];
    const lastActivityId = roomState.votes[lastKey].activityId;

    // Optimistic local update
    const newVotes = { ...roomState.votes };
    delete newVotes[lastKey];
    setRoomState(prev => ({ ...prev, votes: newVotes }));
  };

  // Lock activities into day itinerary
  const handleLockActivitiesToDay = async (dayNumber: number, activityIds: string[]) => {
    setRoomState(prev => ({
      ...prev,
      itineraries: {
        ...prev.itineraries,
        [dayNumber]: {
          ...prev.itineraries[dayNumber],
          activityIds
        }
      }
    }));

    try {
      await fetch(`/api/rooms/${roomId}/lock-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, activityIds })
      });
    } catch (e) {
      console.error('Eroare lock zi:', e);
    }
  };

  // Unlock day
  const handleUnlockDay = async (dayNumber: number) => {
    setRoomState(prev => ({
      ...prev,
      itineraries: {
        ...prev.itineraries,
        [dayNumber]: {
          ...prev.itineraries[dayNumber],
          activityIds: []
        }
      }
    }));

    try {
      await fetch(`/api/rooms/${roomId}/unlock-day`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber })
      });
    } catch (e) {
      console.error('Eroare unlock zi:', e);
    }
  };

  // Add custom activity
  const handleAddActivity = async (activityData: any) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/add-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: activityData })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomState(data.room);
      }
    } catch (e) {
      console.error('Eroare adăugare card nou:', e);
    }
  };

  // Update member car
  const handleUpdateMemberCar = (memberId: string, car: 'Car 1' | 'Car 2') => {
    const updatedMembers = roomState.members.map(m => m.id === memberId ? { ...m, assignedCar: car } : m);
    setRoomState(prev => ({ ...prev, members: updatedMembers }));

    const updatedUser = updatedMembers.find(m => m.id === currentUser.id);
    if (updatedUser) handleSelectUser(updatedUser);
  };

  // Switch Room
  const handleSwitchRoom = (newRoomId: string) => {
    setRoomId(newRoomId);
    window.history.pushState({}, '', `?room=${newRoomId}`);
  };

  if (!hasChosenUser) {
    return (
      <WelcomeScreen
        members={roomState.members}
        onSelectUser={handleSelectUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRoom={roomState}
          currentUser={currentUser}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Main Tab Content */}
        <main className="pb-16">

          {activeTab === 'swipe' && (
            <SwipeDeck
              roomState={roomState}
              currentUser={currentUser}
              activeVotingDay={activeVotingDay}
              onChangeVotingDay={setActiveVotingDay}
              onVote={handleVote}
              onUndoLastVote={handleUndoLastVote}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSwitchTabToConsensus={() => setActiveTab('consensus')}
              onLockTop3ToDay={handleLockTop3ToDay}
            />
          )}

          {activeTab === 'consensus' && (
            <ConsensusView
              roomState={roomState}
              activeVotingDay={activeVotingDay}
              onLockActivitiesToDay={handleLockActivitiesToDay}
              onLockTop3ToDay={handleLockTop3ToDay}
              onSwitchToItinerary={() => setActiveTab('itinerary')}
            />
          )}

          {activeTab === 'itinerary' && (
            <ItineraryView
              roomState={roomState}
              onUnlockDay={handleUnlockDay}
              onLockActivitiesToDay={handleLockActivitiesToDay}
              onSwitchToConsensus={() => setActiveTab('consensus')}
            />
          )}

          {activeTab === 'cars' && (
            <CarLogisticsView
              roomState={roomState}
              onUpdateMemberCar={handleUpdateMemberCar}
            />
          )}

          {activeTab === 'ai' && (
            <AiAssistant roomState={roomState} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>🇬🇷 Kefalonia Trip Matcher 2026 • Villa Louke • 5 Turiști & 2 Mașini • 20 - 26 Iulie</p>
      </footer>

      {/* Modals */}
      <UserSelectionModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        roomState={roomState}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onSwitchRoom={handleSwitchRoom}
      />

      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddActivity={handleAddActivity}
        currentUserName={currentUser.name}
      />
    </div>
  );
}
