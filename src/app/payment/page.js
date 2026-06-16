'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Helper to convert Google Drive link to direct image link
function getDirectImageUrl(url) {
  if (!url) return '';
  
  // Try extracting ID from /file/d/ID/
  const fileDRegex = /drive\.google\.com\/file\/d\/([^\/?]+)/;
  let match = url.match(fileDRegex);
  
  // Try extracting ID from ?id=ID
  if (!match) {
    const idRegex = /[?&]id=([^&]+)/;
    match = url.match(idRegex);
  }

  if (match && match[1]) {
    // The uc endpoint is the standard way to embed public Google Drive images
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  
  return url; // Return as-is if it's already a direct link
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [senderUpiId, setSenderUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  
  const [paymentSettings, setPaymentSettings] = useState({
    qrCodeUrl: '',
    upiId: '',
    bankAccountNumber: '',
    ifscCode: '',
    accountOwnerName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const data = localStorage.getItem('pendingBooking');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      router.push('/');
    }

    // Fetch Global Payment Settings
    const fetchPaymentSettings = async () => {
      try {
        const docRef = doc(db, 'global_settings', 'payment');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPaymentSettings(docSnap.data());
        }
      } catch (err) {
        console.error('Failed to load payment settings', err);
      }
    };
    fetchPaymentSettings();
  }, [router]);

  const handlePaymentComplete = async () => {
    if (!playerName || !whatsappNumber || !senderUpiId) {
      alert('Please fill in all your details so we can verify your payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!bookingData.matchId) {
        throw new Error('No match selected.');
      }

      const payload = {
        playerName,
        whatsappNumber,
        senderUpiId,
        matchId: bookingData.matchId,
        slots: bookingData.slots
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setReceipt({
          bookingId: data.booking.id,
          slots: bookingData.slots.map(s => s.slotNumber).join(', '),
          totalPaid: bookingData.totalFee
        });
        localStorage.removeItem('pendingBooking');
      } else {
        alert(data.error || 'Failed to book slots. They might have been taken.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  if (receipt) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '32px', overflowY: 'auto' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '32px', margin: '0 auto' }}>
          <div style={{ background: '#10B981', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          
          <h2 style={{ color: '#065F46', marginBottom: '8px', fontSize: '28px' }}>Payment Pending Verification</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Your slots have been successfully reserved and are pending admin verification.
          </p>

          <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>Digital Receipt</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#6B7280' }}>Booking ID:</span>
              <strong style={{ color: '#1F2937' }}>{receipt.bookingId || 'Pending'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#6B7280' }}>Slots Booked:</span>
              <strong style={{ color: '#1F2937' }}>{receipt.slots}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#6B7280' }}>Amount Paid:</span>
              <strong style={{ color: 'var(--gold-primary)' }}>₹{receipt.totalPaid}</strong>
            </div>
          </div>

          <div style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', marginBottom: '32px', textAlign: 'left' }}>
            <h4 style={{ color: '#B45309', fontSize: '13px', marginBottom: '8px' }}>Admin Contact Info</h4>
            <p style={{ color: '#92400E', fontSize: '12px', margin: '0 0 4px 0' }}><strong>Phone:</strong> {paymentSettings.phoneNumber || '8917398750'}</p>
            <p style={{ color: '#92400E', fontSize: '12px', margin: 0 }}><strong>Email:</strong> {paymentSettings.email || 'ajay0i0know@gmail.com'}</p>
          </div>

          <button className="btn-primary" onClick={() => router.push('/')} style={{ width: '100%', padding: '14px' }}>
            BACK TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  const qrImageUrl = getDirectImageUrl(paymentSettings.qrCodeUrl);

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'flex-start', padding: '32px' }}>
      <div className="payment-grid">
        
        {/* COLUMN 1: Player Details Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div className="mobile-payment-notice">
            <svg style={{ display: 'inline', width: '16px', height: '16px', marginRight: '6px', verticalAlign: 'text-bottom' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <strong>Note:</strong> QR Code and Bank details are available below. Please complete your payment there first.
          </div>
          
          <h1 className="title" style={{ fontSize: '20px', marginBottom: '4px' }}>Complete Your Booking</h1>
          <p className="subtitle" style={{ marginBottom: '16px', fontSize: '13px' }}>Enter your details and complete the payment to secure your slots.</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Player Name *</label>
            <input 
              type="text" 
              className="input-field" 
              value={playerName} 
              onChange={e => setPlayerName(e.target.value)} 
              placeholder="e.g. Rahul Kumar"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>WhatsApp Number *</label>
            <input 
              type="text" 
              className="input-field" 
              value={whatsappNumber} 
              onChange={e => setWhatsappNumber(e.target.value)} 
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>UTR NO *</label>
            <input 
              type="text" 
              className="input-field" 
              value={senderUpiId} 
              onChange={e => setSenderUpiId(e.target.value)} 
              placeholder="e.g. 312345678901"
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              We need this 12-digit UTR number to verify your payment.
            </p>
          </div>

          <button 
            className="btn-primary" 
            onClick={handlePaymentComplete} 
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: 'auto', padding: '12px' }}
          >
            {isSubmitting ? 'PROCESSING...' : 'I HAVE COMPLETED THE PAYMENT'}
          </button>
        </div>

        {/* COLUMN 2: Amount & Bank Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '4px', color: '#1F2937', fontSize: '15px' }}>Total Due</h3>
            <div style={{ color: 'var(--gold-hover)', fontSize: '32px', fontWeight: '900' }}>₹{bookingData.totalFee}</div>
            <p className="subtitle" style={{ marginTop: '4px', fontSize: '12px' }}>Please send exactly this amount.</p>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', marginBottom: '12px', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px', color: '#374151' }}>Payment Instructions</h3>

            {/* UPI Details */}
            {paymentSettings.upiId && (
              <div style={{ marginBottom: '16px', background: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 'bold' }}>UPI ID</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1F2937' }}>{paymentSettings.upiId}</div>
              </div>
            )}

            {/* Bank Details */}
            {(paymentSettings.bankAccountNumber || paymentSettings.ifscCode) && (
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {/* SBI Watermark */}
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg" 
                  alt="SBI Logo" 
                  style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '100px', opacity: '0.04', pointerEvents: 'none' }} 
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg" alt="SBI" style={{ width: '16px', height: '16px' }} />
                  <h4 style={{ fontSize: '14px', color: '#1F2937', margin: 0, fontWeight: '800' }}>Direct Bank Transfer</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
                  {paymentSettings.accountOwnerName && (
                    <div style={{ background: '#F0FDF4', padding: '6px 12px', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                      <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '1px' }}>ACCOUNT HOLDER</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#059669' }}>{paymentSettings.accountOwnerName}</div>
                    </div>
                  )}
                  {paymentSettings.bankAccountNumber && (
                    <div style={{ background: '#FEF2F2', padding: '6px 12px', borderRadius: '6px', borderLeft: '4px solid #EF4444' }}>
                      <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '1px' }}>A/C NUMBER</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#B91C1C', letterSpacing: '1px' }}>{paymentSettings.bankAccountNumber}</div>
                    </div>
                  )}
                  {paymentSettings.ifscCode && (
                    <div style={{ background: '#EFF6FF', padding: '6px 12px', borderRadius: '6px', borderLeft: '4px solid #3B82F6' }}>
                      <div style={{ fontSize: '10px', color: '#3B82F6', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '1px' }}>IFSC CODE</div>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#1D4ED8', letterSpacing: '1px' }}>{paymentSettings.ifscCode}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: QR Code */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '16px', color: '#374151' }}>Scan to Pay</h3>
          
          {qrImageUrl ? (
            <div style={{ textAlign: 'center' }}>
              <img src={qrImageUrl} alt="Payment QR Code" style={{ width: '100%', maxWidth: '220px', borderRadius: '8px', border: '2px dashed var(--gold-primary)', padding: '6px', background: 'white' }} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: '600' }}>Scan QR Code with any UPI app</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', border: '2px dashed #D1D5DB', borderRadius: '8px', width: '100%', maxWidth: '220px' }}>
              <span style={{ fontSize: '24px' }}>📷</span>
              <p style={{ color: '#9CA3AF', marginTop: '8px', fontSize: '13px', fontWeight: '600' }}>No QR Code Provided</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
