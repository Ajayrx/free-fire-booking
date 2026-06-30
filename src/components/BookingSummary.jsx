import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingSummary({ selectedSlots, setSelectedSlots, activeMatch, activeReservation }) {
  const router = useRouter();
  const [uids, setUids] = useState({});

  if (selectedSlots.length === 0) return null;

  const totalFee = selectedSlots.length * 100;

  const handleUidChange = (slotId, value) => {
    setUids(prev => ({ ...prev, [slotId]: value }));
  };

  const handleProceed = () => {
    for (const slot of selectedSlots) {
      if (!uids[slot.id] || uids[slot.id].trim() === '') {
        alert(`Please enter Free Fire UID for Slot ${slot.slotNumber}`);
        return;
      }
    }

    const bookingData = {
      matchId: activeMatch.id,
      matchNumber: activeMatch.matchNumber,
      reservationId: activeReservation?.reservationId || null,
      ownerToken: activeReservation?.ownerToken || null,
      hold_until: activeReservation?.hold_until || null,
      slots: selectedSlots.map(s => ({ id: s.id, slotNumber: s.slotNumber, freeFireUid: uids[s.id] })),
      totalFee
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    router.push('/payment');
  };

  return (
    <div className="card" style={{ 
      position: 'sticky', 
      bottom: '16px', 
      marginTop: '16px', 
      borderTop: '4px solid var(--gold-primary)',
      zIndex: 10
    }}>
      <div className="booking-summary-container">
        <div className="booking-summary-left">
          <h3 style={{ margin: '0 0 16px 0' }}>Selected Slots: {selectedSlots.map(s => s.slotNumber).join(', ')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
            {selectedSlots.map(slot => (
              <div key={slot.id}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Slot {slot.slotNumber} - Free Fire UID *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter Player UID"
                  value={uids[slot.id] || ''}
                  onChange={(e) => handleUidChange(slot.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="booking-summary-right">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Price per slot</span>
            <span>₹100</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Total</span>
            <span style={{ color: 'var(--gold-primary)' }}>₹{totalFee}</span>
          </div>
          <button className="btn-primary" onClick={handleProceed}>
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>
    </div>
  );
}
