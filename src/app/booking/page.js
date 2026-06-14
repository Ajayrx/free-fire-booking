'use client';

import { useState, useEffect } from 'react';
import TournamentInfo from '@/components/TournamentInfo';
import SlotGrid from '@/components/SlotGrid';
import BookingSummary from '@/components/BookingSummary';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';

export default function LobbyPage() {
  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);

  // Network diagnostic timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        alert("Network Error: The app is unable to connect to the Firebase database. Please check if your phone has actual Internet access through the Windows Mobile Hotspot (it may only have local network access).");
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'global_settings', 'status'), (docSnap) => {
      if (docSnap.exists()) {
        setIsSuspended(docSnap.data().isSuspended || false);
      }
    });
    return () => unsub();
  }, []);

  // Auto-generate matches silently on load
  useEffect(() => {
    fetch('/api/matches/auto-generate', { method: 'POST' }).catch(err => console.error(err));
  }, []);

  // 1. Fetch Matches
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'matches'),
      where('date', '>=', today.getTime())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort matches in memory to avoid needing a Firebase composite index
      fetchedMatches.sort((a, b) => {
        if (a.date === b.date) {
          return (a.matchNumber || 0) - (b.matchNumber || 0);
        }
        return (a.date || 0) - (b.date || 0);
      });
      
      setMatches(fetchedMatches);
      
      setActiveMatch(prev => {
        if (!prev && fetchedMatches.length > 0) {
          return fetchedMatches.find(m => m.status === 'OPEN') || fetchedMatches[0];
        }
        // If the current activeMatch was deleted or changed status, we might need to handle that,
        // but for now just keep the current one
        return prev;
      });
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      alert("Firebase Error: " + error.message);
      setLoading(false); // Stop loading so they can at least see the screen
    });

    return () => unsubscribe();
  }, []);

  const activeMatchId = activeMatch?.id;

  // 2. Fetch Slots for Active Match
  useEffect(() => {
    if (!activeMatchId) return;

    const slotsRef = collection(db, 'matches', activeMatchId, 'slots');
    const unsubscribe = onSnapshot(slotsRef, (snapshot) => {
      const fetchedSlots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.slotNumber - b.slotNumber);
      setSlots(fetchedSlots);
    });

    return () => unsubscribe();
  }, [activeMatchId]);

  const handleSlotClick = (slot) => {
    if (slot.status !== 'AVAILABLE') return;
    
    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      if (selectedSlots.length < 29) {
        setSelectedSlots([...selectedSlots, slot]);
      } else {
        alert('You can select a maximum of 29 slots.');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Lobby...</div>;
  }

  // Separate matches by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysMatches = matches.filter(m => m.date === today.getTime());
  const tomorrowsMatches = matches.filter(m => m.date > today.getTime());

  const renderMatchButtons = (matchList) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {matchList.map((match) => {
        const isSelected = activeMatch?.id === match.id;
        const canSelect = match.status === 'OPEN' || match.status === 'FULL';
        return (
          <button
            key={match.id}
            onClick={() => canSelect && setActiveMatch(match)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '13px',
              border: 'none',
              cursor: canSelect ? 'pointer' : 'not-allowed',
              background: isSelected ? '#1F2937' : (canSelect ? '#E5E7EB' : '#F3F4F6'),
              color: isSelected ? 'white' : (canSelect ? '#1F2937' : '#9CA3AF'),
            }}
          >
            MATCH {match.matchNumber} ({match.status})
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      
      {isSuspended && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'transparent',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          overflow: 'hidden'
        }}>
          <img 
            src="/suspend-banner.png" 
            alt="Match Suspended" 
            className="suspend-banner-img"
          />
        </div>
      )}

      {/* Left Sidebar */}
      <div className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <TournamentInfo activeMatch={activeMatch} joinedCount={slots.filter(s => s.status === 'BOOKED').length} />
      </div>

      {/* Right Content Area */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Match Selector */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', whiteSpace: 'nowrap' }}>TODAY</span>
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          {renderMatchButtons(todaysMatches)}
          
          {tomorrowsMatches.length > 0 && (
            <>
              <div style={{ width: '1px', height: '24px', background: '#D1D5DB', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', whiteSpace: 'nowrap' }}>TOMORROW</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(today.getTime() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {renderMatchButtons(tomorrowsMatches)}
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="title" style={{ margin: 0 }}>Select Your Slot (Match {activeMatch?.matchNumber})</h2>
          <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
            Live Counter: {slots.filter(s => s.status === 'BOOKED').length}/48 Players Joined
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <SlotGrid slots={slots} selectedSlots={selectedSlots} onToggle={handleSlotClick} activeMatch={activeMatch} />
        </div>

        {selectedSlots.length > 0 && (
          <BookingSummary selectedSlots={selectedSlots} setSelectedSlots={setSelectedSlots} activeMatch={activeMatch} />
        )}
      </div>
    </div>
  );
}
