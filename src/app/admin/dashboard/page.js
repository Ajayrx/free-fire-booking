'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, getDoc, where, writeBatch, serverTimestamp } from 'firebase/firestore';

// Robust Timezone Helper: Calculate Date in IST (UTC+5:30)
const getISTDateString = (offsetDays = 0) => {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (330 * 60000));
  istDate.setDate(istDate.getDate() + offsetDays);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

function PaymentSettingsEditor() {
  const [settings, setSettings] = useState({
    qrCodeUrl: '',
    upiId: '',
    bankAccountNumber: '',
    ifscCode: '',
    accountOwnerName: '',
    phoneNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'global_settings', 'payment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error('Failed to load payment settings', err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'global_settings', 'payment'), settings);
      alert('Payment Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings');
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Global Payment Settings</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>These details will be displayed on the checkout page for users to make payments.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#2563EB' }}>Primary UPI / QR Details</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>UPI ID</label>
            <input type="text" value={settings.upiId} onChange={(e) => setSettings({ ...settings, upiId: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. yourname@oksbi" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>QR CODE IMAGE URL (Google Drive/Imgur)</label>
            <input type="text" value={settings.qrCodeUrl} onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. https://drive.google.com/file/d/..." />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>PHONE NUMBER</label>
            <input type="text" value={settings.phoneNumber} onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. 9876543210" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>EMAIL ADDRESS</label>
            <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. ajay0i0know@gmail.com" />
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#059669' }}>Bank Account Details</h3>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>ACCOUNT OWNER NAME</label>
            <input type="text" value={settings.accountOwnerName} onChange={(e) => setSettings({ ...settings, accountOwnerName: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. Rahul Kumar" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>BANK ACCOUNT NUMBER</label>
            <input type="text" value={settings.bankAccountNumber} onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. 3012984928" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>IFSC CODE</label>
            <input type="text" value={settings.ifscCode} onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} placeholder="e.g. SBIN0001234" />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
        <button type="submit" disabled={saving} style={{ background: '#1F2937', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>
    </form>
  );
}

function MatchSettingsEditor({ match }) {
  const defaultSettings = {
    ammoLimit: 'YES', throwableLimit: 'YES', ep: '0', vehicles: 'YES',
    airdrop: 'YES', hp: '200', movementSpeed: '100%', jumpHeight: '100%',
    environment: 'DAY', loadout: 'YES', characterSkill: 'YES', gunAttributes: 'YES',
    genericEnemyOutfit: 'NO', friendlyFire: 'NO', preciseAim: 'YES', autoRevival: 'NO',
    zoneShrinkSpeed: 'STANDARD', outOfZoneDamage: 'STANDARD', quitOutPenalty: 'NO',
    headshot: 'NO', warChest: 'YES', revival: 'YES'
  };

  const [settings, setSettings] = useState({ ...defaultSettings, ...(match?.settings || {}) });
  const [prizeConfig, setPrizeConfig] = useState(match?.prizeConfig || { entryFee: 100, winnerFixed: 1000 });
  const [roomId, setRoomId] = useState(match?.roomId || '');
  const [roomPass, setRoomPass] = useState(match?.roomPass || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (match) {
      setSettings({ ...defaultSettings, ...(match.settings || {}) });
      setPrizeConfig(match.prizeConfig || { entryFee: 100, winnerFixed: 1000 });
      setRoomId(match.roomId || '');
      setRoomPass(match.roomPass || '');
    }
  }, [match]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!match?.id) return;
    setSaving(true);
    try {
      const matchRef = doc(db, 'matches', match.id);
      await updateDoc(matchRef, { settings, prizeConfig, roomId, roomPass });
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings');
    }
    setSaving(false);
  };

  if (!match) return null;

  return (
    <form onSubmit={handleSave}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Match {match.matchNumber} Settings</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '16px' }}>
        
        {/* 1. Prize Pool & Fees */}
        <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#059669' }}>Prize Pool & Fees</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>ENTRY FEE (₹)</label>
              <input 
                type="number" 
                value={prizeConfig.entryFee} 
                onChange={(e) => setPrizeConfig({ ...prizeConfig, entryFee: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>WINNER FIXED PRIZE (₹)</label>
              <input 
                type="number" 
                value={prizeConfig.winnerFixed} 
                onChange={(e) => setPrizeConfig({ ...prizeConfig, winnerFixed: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* 2. Room ID & Pass */}
        <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#2563EB' }}>Room ID & Pass</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>ROOM ID</label>
              <input 
                type="text" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 130187393"
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>PASSWORD</label>
              <input 
                type="text" 
                value={roomPass} 
                onChange={(e) => setRoomPass(e.target.value)}
                placeholder="e.g. 2995"
                style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Game Configuration */}
        <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#D97706' }}>Game Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {Object.keys(settings).map((key) => (
              <div key={key} style={{ marginBottom: '4px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#4B5563', textTransform: 'uppercase', marginBottom: '2px' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input 
                  type="text" 
                  value={settings[key]} 
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  style={{ width: '100%', padding: '6px', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
        <button 
          type="submit" 
          disabled={saving}
          style={{ background: '#1F2937', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

function SecuritySettingsEditor() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'global_settings', 'security');
      const docSnap = await getDoc(docRef);
      const actualPassword = docSnap.exists() ? docSnap.data().password || 'admin123' : 'admin123';
      
      if (currentPassword !== actualPassword) {
        alert('Current password is incorrect');
        setSaving(false);
        return;
      }
      
      await setDoc(docRef, { password: newPassword }, { merge: true });
      alert('Admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      alert('Failed to update password');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} style={{ maxWidth: '400px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '20px', color: '#111827' }}>Security Settings</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Change the admin dashboard password. Keep this safe!</p>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>CURRENT PASSWORD</label>
        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '4px' }}>NEW PASSWORD</label>
        <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: '4px' }} />
      </div>
      
      <button type="submit" disabled={saving} style={{ background: '#DC2626', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

function ClearSlotPanel({ activeMatchId }) {
  const [slotNum, setSlotNum] = useState('');
  const [clearing, setClearing] = useState(false);

  const handleClear = async (e) => {
    e.preventDefault();
    if (!activeMatchId) return alert('No match selected');
    if (!slotNum || isNaN(slotNum) || Number(slotNum) < 1 || Number(slotNum) > 48) {
      return alert('Enter a valid slot number between 1 and 48');
    }

    if (!confirm(`Are you sure you want to clear Slot ${slotNum} for this match? This will make the slot available for booking again.`)) return;

    setClearing(true);
    try {
      const slotRef = doc(db, 'matches', activeMatchId, 'slots', String(slotNum));
      await updateDoc(slotRef, {
        status: 'AVAILABLE',
        bookedBy: null,
        bookingId: null,
        freeFireUid: null,
        playerName: null,
        whatsappNumber: null
      });
      alert(`Slot ${slotNum} cleared successfully!`);
      setSlotNum('');
    } catch (err) {
      console.error(err);
      alert('Failed to clear slot. Please try again.');
    }
    setClearing(false);
  };

  return (
    <>
      <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Clear a Booked Slot</h2>
      
      <form onSubmit={handleClear} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', maxWidth: '400px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4B5563', marginBottom: '8px' }}>SLOT NUMBER</label>
          <input 
            type="number" 
            min="1" 
            max="48" 
            required 
            value={slotNum}
            onChange={(e) => setSlotNum(e.target.value)}
            placeholder="e.g. 12"
            style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '4px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={clearing}
          style={{ padding: '12px 24px', background: '#DC2626', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {clearing ? 'Clearing...' : 'Clear Slot'}
        </button>
      </form>
    </>
  );
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  // Hydrate auth state from session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch global status
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(doc(db, 'global_settings', 'status'), (docSnap) => {
      if (docSnap.exists()) {
        setIsSuspended(docSnap.data().isSuspended || false);
      }
    });
    return () => unsub();
  }, [isAuthenticated]);

  const toggleSuspension = async () => {
    try {
      await setDoc(doc(db, 'global_settings', 'status'), { isSuspended: !isSuspended }, { merge: true });
    } catch (err) {
      console.error(err);
      alert('Failed to update suspension status');
    }
  };

  // 1. Fetch Matches
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'matches'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedMatches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const todayStr = getISTDateString(0);
      const tomorrowStr = getISTDateString(1);
      const todayTime = new Date(`${todayStr}T00:00:00+05:30`).getTime();
      const tomorrowTime = new Date(`${tomorrowStr}T00:00:00+05:30`).getTime();

      // Sort locally by date then matchNumber
      fetchedMatches.sort((a, b) => {
        const dateA = a.dateStr || (a.date ? new Date(a.date).toISOString().slice(0, 10) : '');
        const dateB = b.dateStr || (b.date ? new Date(b.date).toISOString().slice(0, 10) : '');
        if (dateA === dateB) {
          return (a.matchNumber || 0) - (b.matchNumber || 0);
        }
        return dateA.localeCompare(dateB);
      });
      
      setMatches(fetchedMatches);
      
      setActiveMatchId(prev => {
        const activePool = fetchedMatches.filter(m => 
          m.dateStr === todayStr || m.dateStr === tomorrowStr || 
          m.date === todayTime || m.date === tomorrowTime
        );
        if (!prev || !activePool.find(m => m.id === prev)) {
          return activePool.length > 0 ? activePool[0].id : (fetchedMatches.length > 0 ? fetchedMatches[0].id : null);
        }
        return prev;
      });
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // 2. Fetch Bookings
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetchedBookings);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (booking, newStatus) => {
    try {
      if (newStatus === 'APPROVED' && booking.slots && booking.matchId) {
        // Check if any slot is already BOOKED by a different booking
        for (const slot of booking.slots) {
          const slotRef = doc(db, 'matches', booking.matchId, 'slots', slot.slotId.toString());
          const slotSnap = await getDoc(slotRef);
          if (slotSnap.exists() && slotSnap.data().status === 'BOOKED' && slotSnap.data().bookingId !== booking.id) {
            alert(`Cannot approve: Slot ${slot.slotNumber} is already APPROVED for another player!`);
            return;
          }
        }
      }

      await setDoc(doc(db, 'bookings', booking.id), { status: newStatus }, { merge: true });
      
      if (booking.slots && booking.matchId) {
        const batch = writeBatch(db);
        if (booking.reservationId) {
          const resRef = doc(db, 'reservations', booking.reservationId);
          if (newStatus === 'APPROVED') {
            batch.update(resRef, { status: 'COMPLETED', approvedAt: serverTimestamp() });
          } else if (newStatus === 'REJECTED') {
            batch.update(resRef, { status: 'REJECTED', rejectedAt: serverTimestamp() });
          }
        }
        for (const slot of booking.slots) {
          const slotRef = doc(db, 'matches', booking.matchId, 'slots', slot.slotId.toString());
          if (newStatus === 'APPROVED') {
            batch.update(slotRef, { status: 'BOOKED', bookingId: booking.id });
          } else if (newStatus === 'REJECTED') {
            batch.update(slotRef, { 
              status: 'AVAILABLE', 
              bookingId: null, 
              freeFireUid: null, 
              playerName: null, 
              whatsappNumber: null,
              reservationId: null,
              hold_until: null
            });
          }
        }
        await batch.commit();
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-cream)' }}>
        <form 
          className="card" 
          style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const docSnap = await getDoc(doc(db, 'global_settings', 'security'));
              const actualPassword = docSnap.exists() ? docSnap.data().password || 'admin123' : 'admin123';
              
              if (password === actualPassword) {
                if (typeof window !== 'undefined') sessionStorage.setItem('adminAuth', 'true');
                setIsAuthenticated(true);
              } else {
                alert('Invalid password');
              }
            } catch (err) {
              console.error(err);
              alert('Error verifying password');
            }
          }}
        >
          <h2 style={{ margin: 0, color: '#1F2937' }}>Admin Login</h2>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px' }}
          />
          <button type="submit" style={{ padding: '12px', background: '#1F2937', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  const activeBookings = bookings.filter(b => b.matchId === activeMatchId);
  const activeMatchObj = matches.find(m => m.id === activeMatchId);

  const todayStr = getISTDateString(0);
  const tomorrowStr = getISTDateString(1);
  const todayTime = new Date(`${todayStr}T00:00:00+05:30`).getTime();
  const tomorrowTime = new Date(`${tomorrowStr}T00:00:00+05:30`).getTime();

  const todaysMatches = matches.filter(m => m.dateStr === todayStr || m.date === todayTime);
  const tomorrowsMatches = matches.filter(m => m.dateStr === tomorrowStr || m.date === tomorrowTime);
  const otherMatches = matches.filter(m => !todaysMatches.includes(m) && !tomorrowsMatches.includes(m));

  const renderMatchButtons = (matchList) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {matchList.map((match) => {
        const dStr = match.dateStr || (match.date ? new Date(match.date).toISOString().slice(0, 10) : '????-??-??');
        const dayNum = dStr.split('-')[2] || '??';
        return (
          <button
            key={match.id}
            onClick={() => setActiveMatchId(match.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              background: activeMatchId === match.id ? '#1F2937' : '#E5E7EB',
              color: activeMatchId === match.id ? 'white' : '#4B5563',
            }}
          >
            Day {dayNum} M{match.matchNumber} ({match.status})
          </button>
        );
      })}
    </div>
  );

  const renderMobileMatchGroup = (matchList, label, dateTime) => {
    const d = new Date(dateTime || Date.now());
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const date = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const year = d.getFullYear();
    let prefix = '';
    if (label === 'TODAY') prefix = 'today ';
    if (label === 'TOMORROW') prefix = 'tomorrow ';
    const finalDateStr = `${prefix}${day} ${date} ${month} ${year}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
          {finalDateStr}
        </div>
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {matchList.map((match) => (
            <button
              key={match.id}
              onClick={() => setActiveMatchId(match.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                background: activeMatchId === match.id ? '#1F2937' : '#E5E7EB',
                color: activeMatchId === match.id ? 'white' : '#4B5563',
              }}
            >
              match {match.matchNumber} {match.status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container" style={{ display: 'block', padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="admin-header-flex">
        <h1 className="title" style={{ margin: 0, textTransform: 'uppercase', color: '#0891B2' }}>ADMIN DASHBOARD</h1>
        <div className="admin-header-buttons">
          <button 
            onClick={toggleSuspension}
            style={{
              padding: '12px 24px',
              background: isSuspended ? '#059669' : '#DC2626',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              textTransform: 'uppercase',
              flex: 1,
              width: '100%'
            }}
          >
            {isSuspended ? 'RESUME ALL TOURNAMENTS' : 'SUSPEND ALL TOURNAMENTS'}
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            style={{ flex: 1, width: '100%', padding: '12px 24px', fontWeight: 'bold', fontSize: '14px', background: activeTab === 'payment' ? '#D97706' : '#E5E7EB', color: activeTab === 'payment' ? 'white' : '#4B5563', border: 'none', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Payment Settings
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            style={{ flex: 1, width: '100%', padding: '12px 24px', fontWeight: 'bold', fontSize: '14px', background: activeTab === 'security' ? '#D97706' : '#E5E7EB', color: activeTab === 'security' ? 'white' : '#4B5563', border: 'none', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            Security
          </button>
        </div>
      </div>

      <div className="desktop-match-selector" style={{ gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', alignItems: 'center' }}>
        {todaysMatches.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', whiteSpace: 'nowrap' }}>TODAY</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(todayTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {renderMatchButtons(todaysMatches)}
          </>
        )}

        {tomorrowsMatches.length > 0 && (
          <>
            {todaysMatches.length > 0 && <div style={{ width: '1px', height: '24px', background: '#D1D5DB', margin: '0 8px' }}></div>}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px', whiteSpace: 'nowrap' }}>TOMORROW</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(tomorrowTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {renderMatchButtons(tomorrowsMatches)}
          </>
        )}
      </div>

      <div className="mobile-match-selector" style={{ flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {todaysMatches.length > 0 && renderMobileMatchGroup(todaysMatches, 'TODAY', todayTime)}
        {tomorrowsMatches.length > 0 && renderMobileMatchGroup(tomorrowsMatches, 'TOMORROW', tomorrowTime)}
      </div>

      <div className="admin-tab-buttons" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('bookings')}
          style={{ padding: '10px 20px', fontWeight: 'bold', background: activeTab === 'bookings' ? '#D97706' : '#E5E7EB', color: activeTab === 'bookings' ? 'white' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Manage Bookings
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          style={{ padding: '10px 20px', fontWeight: 'bold', background: activeTab === 'settings' ? '#D97706' : '#E5E7EB', color: activeTab === 'settings' ? 'white' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Match Settings
        </button>
        <button 
          onClick={() => setActiveTab('clear_slots')}
          style={{ padding: '10px 20px', fontWeight: 'bold', background: activeTab === 'clear_slots' ? '#D97706' : '#E5E7EB', color: activeTab === 'clear_slots' ? 'white' : '#4B5563', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Clear Slot
        </button>
      </div>

      <div className="card scrollable-panel">
        {activeTab === 'bookings' ? (
          <>
            <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Bookings for Selected Match</h2>
            
            {activeBookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No bookings for this match yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px', color: '#6B7280' }}>Player & WhatsApp</th>
                    <th style={{ padding: '12px 8px', color: '#6B7280' }}>UPI / Payment Info</th>
                    <th style={{ padding: '12px 8px', color: '#6B7280' }}>Slots & UIDs</th>
                    <th style={{ padding: '12px 8px', color: '#6B7280' }}>Status</th>
                    <th style={{ padding: '12px 8px', color: '#6B7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: 'bold', color: '#1F2937' }}>{b.playerName}</div>
                        <div style={{ color: '#059669', fontSize: '13px', marginTop: '4px' }}>{b.whatsappNumber}</div>
                      </td>
                      <td style={{ padding: '16px 8px', color: '#D97706', fontWeight: '500' }}>
                        {b.senderUpiId}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        {(b.slots || []).map((s, i) => (
                          <div key={i} style={{ fontSize: '12px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', margin: '2px' }}>
                            <span style={{ color: '#6B7280', marginRight: '4px' }}>Slot {s.slotNumber}:</span> 
                            <strong style={{ color: '#111827' }}>{s.freeFireUid || 'UID Added'}</strong>
                          </div>
                        ))}
                        {(!b.slots && b.slotNumbers ? b.slotNumbers : []).map((num, i) => (
                          <div key={'old-'+i} style={{ fontSize: '12px', background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', margin: '2px' }}>
                            <span style={{ color: '#6B7280', marginRight: '4px' }}>Slot {num}:</span> 
                            <strong style={{ color: '#111827' }}>UID Added</strong>
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          background: b.status === 'APPROVED' ? '#D1FAE5' : b.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                          color: b.status === 'APPROVED' ? '#065F46' : b.status === 'REJECTED' ? '#991B1B' : '#B45309'
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        {(b.status === 'PENDING' || b.status === 'PENDING_VERIFICATION') && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleUpdateStatus(b, 'APPROVED')}
                              style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(b, 'REJECTED')}
                              style={{ background: '#DC2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : activeTab === 'settings' ? (
          <MatchSettingsEditor match={activeMatchObj} />
        ) : activeTab === 'security' ? (
          <SecuritySettingsEditor />
        ) : activeTab === 'clear_slots' ? (
          <ClearSlotPanel activeMatchId={activeMatchId} />
        ) : (
          <PaymentSettingsEditor />
        )}
      </div>
    </div>
  );
}
