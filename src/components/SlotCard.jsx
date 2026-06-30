export default function SlotCard({ slot, isSelected, onToggle, pendingSlotIds, activeReservation }) {
  const isStaleHold = slot.status === 'HELD' && (!slot.hold_until || slot.hold_until < Date.now());
  const isHeldByOther = slot.status === 'HELD' && slot.hold_until >= Date.now() && (!activeReservation || slot.reservationId !== activeReservation.reservationId);
  const isAvailable = slot.status === 'AVAILABLE' || slot.status === 'OPEN' || isStaleHold;
  const isPending = slot.status === 'PENDING' || slot.status === 'PENDING_VERIFICATION';
  const isBooked = slot.status === 'BOOKED' || slot.status === 'CONFIRMED';
  const isPendingClick = pendingSlotIds?.includes(slot.id);

  let borderColor = 'var(--green-border)';
  let bgColor = 'var(--green-bg)';
  let textColor = 'var(--green-text)';
  let statusText = 'AVAILABLE';

  if (isBooked) {
    borderColor = 'var(--red-border)';
    bgColor = 'var(--red-bg)';
    textColor = 'var(--red-text)';
    statusText = `Booked- ${slot.freeFireUid || 'Player'}`;
  } else if (isPending) {
    borderColor = '#F59E0B'; // Orange
    bgColor = '#FEF3C7';
    textColor = '#B45309';
    statusText = 'PENDING';
  } else if (isHeldByOther) {
    borderColor = '#D97706'; // Amber
    bgColor = '#FEF3C7';
    textColor = '#92400E';
    statusText = 'HELD';
  } else if (isSelected) {
    borderColor = 'var(--gold-primary)';
    bgColor = 'var(--gold-light)';
    textColor = 'var(--gold-hover)';
    statusText = 'SELECTED';
  }

  if (isPendingClick) {
    statusText = 'RESERVING...';
  }

  const canClick = (isAvailable || isSelected) && !isPendingClick && !isHeldByOther && !isBooked && !isPending;

  const handleClick = () => {
    if (canClick) {
      onToggle(slot);
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '4px',
        cursor: canClick ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'stretch',
        height: '32px',
        transition: 'all 0.2s',
        opacity: canClick ? 1 : 0.75,
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        width: '36px', 
        background: 'rgba(0,0,0,0.05)', 
        borderRight: `1px solid ${borderColor}`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '900'
      }}>
        {String(slot.slotNumber).padStart(2, '0')}
      </div>
      <div style={{ 
        flex: 1, 
        padding: '0 8px', 
        display: 'flex', 
        alignItems: 'center', 
        fontSize: '11px', 
        fontWeight: '700', 
        whiteSpace: 'nowrap', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis' 
      }}>
        {statusText}
      </div>
    </div>
  );
}
