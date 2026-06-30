'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: '#FDFBF7', /* White/Cream background */
      backgroundImage: 'radial-gradient(circle at center, #FFFFFF 0%, #FDFBF7 100%)',
      color: '#111827',
      textAlign: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glitch or distressed backdrop effect */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '25vw',
        fontWeight: '900',
        color: 'rgba(255, 106, 0, 0.05)', /* Slightly visible orange on white */
        fontFamily: "var(--font-anton), 'Anton', sans-serif",
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        404
      </div>

      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{
          fontSize: '5rem',
          fontFamily: "var(--font-anton), 'Anton', sans-serif",
          color: '#ff6a00',
          margin: '0 0 10px 0',
          textShadow: '0 4px 15px rgba(255, 106, 0, 0.2)', /* Soft shadow for white bg */
          lineHeight: '1'
        }}>
          ELIMINATED
        </h1>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          margin: '0 0 20px 0',
          letterSpacing: '2px',
          color: '#111827' /* Dark text */
        }}>
          PAGE NOT FOUND IN THE SAFE ZONE
        </h2>
        
        <p style={{
          color: '#4B5563', /* Darker gray for readability on white */
          fontSize: '1.1rem',
          maxWidth: '500px',
          marginBottom: '40px',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          The page you are looking for has been caught outside the safe zone or doesn't exist anymore. Grab your loot and head back before the zone shrinks further.
        </p>

        <Link href="/" style={{
          background: '#ff6a00',
          color: 'white',
          padding: '16px 32px',
          borderRadius: '8px',
          fontFamily: "var(--font-anton), 'Anton', sans-serif",
          fontSize: '1.2rem',
          letterSpacing: '1px',
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(255, 106, 0, 0.4)',
          transition: 'transform 0.2s',
          display: 'inline-block'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          RETURN TO LOBBY
        </Link>
      </div>
    </div>
  );
}
