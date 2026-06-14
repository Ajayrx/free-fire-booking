'use client';

export default function TicketsPage() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '16px', fontFamily: "'Anton', sans-serif" }}>UNDER MAINTENANCE</h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem', marginBottom: '32px' }}>
          The ticketing system is currently undergoing scheduled maintenance and upgrades.
        </p>
        <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', padding: '20px', borderRadius: '8px' }}>
          <p style={{ color: '#B91C1C', fontWeight: 'bold', margin: '0 0 8px 0' }}>Need immediate assistance?</p>
          <p style={{ margin: 0, color: '#111827' }}>
            Contact me at: <a href="mailto:ajay0i0know@gmail.com" style={{ color: '#E11D48', textDecoration: 'underline' }}>ajay0i0know@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
