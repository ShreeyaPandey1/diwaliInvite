import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ eventDate = "2026-11-05", startTime = "1:00 PM" }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    const calculateTime = () => {
      // Parse event date and time
      // Default fallback 2026-11-05 13:00:00
      let targetTime;
      try {
        const timePart = startTime.toLowerCase().includes('pm') && !startTime.includes('12:')
          ? `${parseInt(startTime) + 12}:00:00`
          : '13:00:00';
        targetTime = new Date(`${eventDate}T${timePart}`).getTime();
      } catch (e) {
        targetTime = new Date('2026-11-05T13:00:00').getTime();
      }

      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventDate, startTime]);

  if (timeLeft.isPast) {
    return (
      <div className="card-glass border-gold-glow rounded-2xl p-5 text-center my-4 animate-pulse">
        <span className="text-xl md:text-2xl font-bold text-gold-gradient tracking-wide">
          ✨ The Celebration Is Happening Now! ✨
        </span>
      </div>
    );
  }

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#f7c948]/60" />
        <span className="text-xs uppercase tracking-widest text-[#f7c948] font-semibold flex items-center gap-1.5">
          <span>⏳</span> COUNTDOWN TO CELEBRATION
        </span>
        <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#f7c948]/60" />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className="card-glass-interactive rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden group border border-[#f7c948]/20"
          >
            {/* Top golden shimmer accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f7c948] to-transparent opacity-60" />

            <div className="text-2xl sm:text-4xl font-extrabold text-gold-gradient font-display drop-shadow-[0_2px_10px_rgba(247,201,72,0.4)]">
              {String(unit.value).padStart(2, '0')}
            </div>

            <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-pink-200/80 mt-1 uppercase">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
