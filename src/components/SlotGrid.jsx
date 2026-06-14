import SlotCard from './SlotCard';

export default function SlotGrid({ slots, selectedSlots, onToggle, activeMatch }) {
  if (!slots || slots.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No slots available or match not open.
      </div>
    );
  }

  const joinedCount = slots.filter(s => s.status === 'BOOKED' || s.status === 'PENDING').length;
  
  const roomId = activeMatch?.roomId || '';
  const roomPass = activeMatch?.roomPass || '';
  const matchNum = activeMatch?.matchNumber || 1;
  const matchTime = matchNum === 1 ? '8 PM' : matchNum === 2 ? '8:30 PM' : '9 PM';

  return (
    <div className="card scrollable-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div className="slot-header">
        <h2 className="title" style={{ margin: 0, whiteSpace: 'nowrap' }}>SELECT YOUR SLOT</h2>
        
        <div style={{ flex: 1, margin: '0 16px', textAlign: 'center' }}>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '6px 16px', background: '#F9FAFB', display: 'inline-block' }}>
            <span style={{ fontWeight: 'bold', color: '#1F2937', marginRight: '16px' }}>Room ID : {roomId || '---'}</span>
            <span style={{ fontWeight: 'bold', color: '#1F2937' }}>Pass : {roomPass || '---'}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', fontWeight: 'bold' }}>
            Available at {matchTime}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
          <span>👥 {joinedCount}/48 PLAYERS</span>
        </div>
      </div>

      <div className="slot-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--green-border)' }}></div>
          AVAILABLE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--red-border)' }}></div>
          BOOKED
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
          PENDING
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gold-primary)' }}></div>
          SELECTED
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {slots.map((slot) => (
          <SlotCard 
            key={slot.id} 
            slot={slot} 
            isSelected={selectedSlots.some(s => s.id === slot.id)} 
            onToggle={onToggle}
          />
        ))}
      </div>
      
    </div>
  );
}
