'use client';
import { useState } from 'react';

export default function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <a href="#" onClick={(e) => { e.preventDefault(); setIsOpen(true); }} style={{ textDecoration: 'none', color: '#7C3AED', fontWeight: '800', fontSize: '13px' }}>
        HOW TO PLAY/RULES
      </a>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card scrollable-panel" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', position: 'relative' }}>
            <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}>✖</button>
            <h2 style={{ margin: '0 0 16px 0', color: '#1F2937' }}>How to Play & Rules</h2>
            <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>
              <h4 style={{ color: '#D97706', margin: '16px 0 4px 0' }}>1. Booking & Slots</h4>
              <p style={{ margin: '0 0 8px 0' }}>Select an available slot, enter your exact Free Fire UID, and complete the payment. Your slot is only confirmed after admin verification.</p>
              
              <h4 style={{ color: '#D97706', margin: '16px 0 4px 0' }}>2. Match Timing</h4>
              <p style={{ margin: '0 0 8px 0' }}>Room ID and Password will be shared 5 minutes before the match starts via Discord and the select slot page as per security. Be online and ready.</p>
              
              <h4 style={{ color: '#D97706', margin: '16px 0 4px 0' }}>3. Gameplay Rules</h4>
              <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>
                <li>No teaming or teaming up with enemies.</li>
                <li>No hacks, scripts, or third-party modifications.</li>
                <li>Respect the Match Settings (e.g. No Grenades if Throwable Limit is YES).</li>
              </ul>
              
              <h4 style={{ color: '#D97706', margin: '16px 0 4px 0' }}>4. Disconnections</h4>
              <p style={{ margin: '0 0 8px 0' }}>If you disconnect due to your internet, the match will continue. We are not responsible for personal network issues.</p>
              
              <h4 style={{ color: '#D97706', margin: '16px 0 4px 0' }}>5. Prize Distribution</h4>
              <p style={{ margin: '0 0 8px 0' }}>Prizes will be sent to the UPI ID you provided during booking within 2 hours after match completion.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
