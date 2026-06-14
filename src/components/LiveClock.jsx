'use client';

import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState(null); // null initially for hydration matching

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return <div style={{ width: '150px', height: '24px' }}></div>; // placeholder
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayName = days[time.getDay()];
  const dateStr = `${time.getDate()} ${months[time.getMonth()]}`;
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
      <div style={{ color: '#D97706', fontWeight: 'bold', fontSize: '13px' }}>
        {dayName}, {dateStr}
      </div>
      <div style={{ color: '#111827', fontWeight: '800', fontSize: '15px' }}>
        {timeStr}
      </div>
    </div>
  );
}
