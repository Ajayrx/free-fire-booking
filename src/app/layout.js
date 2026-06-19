import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: 'FF Tournaments - Solo Battle',
  description: 'Premium Free Fire Tournament Booking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: 'var(--bg-cream)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar with Scroll Morphing */}
        <Navigation />
        
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
