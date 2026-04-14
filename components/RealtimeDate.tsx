'use client';

import { useState, useEffect } from 'react';

export default function RealtimeDate() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchCurrentTime = async () => {
      try {
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Jakarta');
        const data = await response.json();
        setCurrentTime(new Date(data.dateTime));
      } catch (error) {
        console.error('Failed to fetch current time:', error);
        setCurrentTime(new Date());
      }
    };

    fetchCurrentTime();

    const interval = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  return (
    <div className="mt-4 p-4 rounded-xl glass-card border border-indigo-500/30 backdrop-blur-md">
      <p className="text-sm font-semibold" style={{ color: '#a5b4fc', letterSpacing: '0.5px' }}>
        📅 {formatDateTime(currentTime)}
      </p>
    </div>
  );
}