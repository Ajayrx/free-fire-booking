import { Inter, Anton } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });

export const metadata = {
  title: 'FF Tournaments - Solo Battle',
  description: 'Premium Free Fire Tournament Booking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      </head>
      <body className={`${inter.className} ${anton.variable}`} style={{ background: 'var(--bg-cream)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar with Scroll Morphing */}
        <Navigation />
        
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
