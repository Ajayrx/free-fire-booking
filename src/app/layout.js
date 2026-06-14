import { Inter } from 'next/font/google';
import './globals.css';
import LiveClock from '@/components/LiveClock';
import RulesModal from '@/components/RulesModal';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'FF Tournaments - Solo Battle',
  description: 'Premium Free Fire Tournament Booking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: 'var(--bg-cream)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar - Dynamic Island Style */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 16px 0 16px', position: 'sticky', top: 0, zIndex: 50 }}>
          <nav className="nav-bar">
            <div className="nav-brand">
              Bala Esports || FF TOURNAMENTS
            </div>
            <div className="nav-links">
              <a href="/" style={{ textDecoration: 'none', color: '#059669', fontWeight: '800', fontSize: '13px' }}>HOME</a>
              <a href="/booking" style={{ textDecoration: 'none', color: '#D97706', fontWeight: '800', fontSize: '13px' }}>BOOKING</a>
              <a href="/tickets" style={{ textDecoration: 'none', color: '#E11D48', fontWeight: '800', fontSize: '13px' }}>TICKETS</a>
              <a href="https://discord.gg/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#5865F2', fontWeight: '800', fontSize: '13px' }}>DISCORD</a>
              <RulesModal />
              <a href="/admin/dashboard" style={{ textDecoration: 'none', color: '#0891B2', fontWeight: '800', fontSize: '13px', marginRight: '24px' }}>ADMIN</a>
            </div>
            
            {/* Live Clock Component */}
            <LiveClock />
          </nav>
        </div>
        
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
