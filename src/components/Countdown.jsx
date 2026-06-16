import React, { useState, useEffect } from 'react';

const Countdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center items-center py-4 w-full h-full space-x-1 sm:space-x-2 md:space-x-4">
      <div className="text-center bg-white/20 backdrop-blur-md p-1.5 sm:p-2 md:p-3 rounded-lg border border-white/30 shadow-sm min-w-[55px] sm:min-w-[70px]">
        <div className="modern-num text-2xl md:text-3xl font-black silver-foil mb-1 drop-shadow-md" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.4)' }}>
          {timeLeft.days}
        </div>
        <div className="serif-font text-[8px] md:text-[10px] uppercase tracking-widest text-secondary-blue font-bold">Día</div>
      </div>
      <div className="text-center bg-white/20 backdrop-blur-md p-1.5 sm:p-2 md:p-3 rounded-lg border border-white/30 shadow-sm min-w-[55px] sm:min-w-[70px]">
        <div className="modern-num text-2xl md:text-3xl font-black silver-foil mb-1 drop-shadow-md" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.4)' }}>
          {timeLeft.hours}
        </div>
        <div className="serif-font text-[8px] md:text-[10px] uppercase tracking-widest text-secondary-blue font-bold">Horas</div>
      </div>
      <div className="text-center bg-white/20 backdrop-blur-md p-1.5 sm:p-2 md:p-3 rounded-lg border border-white/30 shadow-sm min-w-[55px] sm:min-w-[70px]">
        <div className="modern-num text-2xl md:text-3xl font-black silver-foil mb-1 drop-shadow-md" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.4)' }}>
          {timeLeft.minutes}
        </div>
        <div className="serif-font text-[8px] md:text-[10px] uppercase tracking-widest text-secondary-blue font-bold">Minutos</div>
      </div>
      <div className="text-center bg-white/20 backdrop-blur-md p-1.5 sm:p-2 md:p-3 rounded-lg border border-white/30 shadow-sm min-w-[55px] sm:min-w-[70px]">
        <div className="modern-num text-2xl md:text-3xl font-black silver-foil mb-1 drop-shadow-md" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5), -1px -1px 0 rgba(255,255,255,0.4)' }}>
          {timeLeft.seconds}
        </div>
        <div className="serif-font text-[8px] md:text-[10px] uppercase tracking-widest text-secondary-blue font-bold">Segundos</div>
      </div>
    </div>
  );
};

export default Countdown;
