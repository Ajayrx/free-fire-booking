export default function SlotCard({ slot, isSelected, onToggle }) {
  const isAvailable = slot.status === 'AVAILABLE';
  const isPending = slot.status === 'PENDING';
  const isBooked = slot.status === 'BOOKED';

  let borderColor = 'var(--green-border)';
  let bgColor = 'var(--green-bg)';
  let textColor = 'var(--green-text)';
  let statusText = 'AVAILABLE';

  if (isBooked) {
    borderColor = 'var(--red-border)';
    bgColor = 'var(--red-bg)';
    textColor = 'var(--red-text)';
    statusText = `Booked- ${slot.freeFireUid}`;
  } else if (isPending) {
    borderColor = '#F59E0B'; // Orange
    bgColor = '#FEF3C7';
    textColor = '#B45309';
    statusText = 'PENDING';
  } else if (isSelected) {
    borderColor = 'var(--gold-primary)';
    bgColor = 'var(--gold-light)';
    textColor = 'var(--gold-hover)';
    statusText = 'SELECTED';
  }

  const handleClick = () => {
    if (isAvailable) {
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
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'stretch',
        height: '32px',
        transition: 'all 0.2s',
        opacity: isAvailable || isSelected ? 1 : 0.8,
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
