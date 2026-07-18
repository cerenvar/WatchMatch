import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function MatchWheel({ options, onSelect }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef(null);

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F43F5E', '#84CC16', '#0EA5E9'
  ];

  const spinWheel = async () => {
    if (isSpinning || options.length === 0) return;
    setIsSpinning(true);

    const spinDuration = 4;
    const spins = 5;
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = spins * 360 + extraDegrees;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: spinDuration, ease: "circOut" }
    });

    const sliceAngle = 360 / options.length;
    const normalizedRotation = totalRotation % 360;
    const selectedIndex = Math.floor((360 - normalizedRotation + (sliceAngle / 2)) % 360 / sliceAngle);

    onSelect(options[selectedIndex]);
    setIsSpinning(false);
  };

  useEffect(() => {
    controls.set({ rotate: 0 });
  }, [options, controls]);

  if (!options || options.length === 0) return null;

  const sliceAngle = 360 / options.length;

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto">
      {/* Pointer */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20 drop-shadow-xl">
        <svg viewBox="0 0 24 24" fill="#F5F7FA" className="w-full h-full rotate-180">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      </div>

      {/* Wheel */}
      <div className="w-full h-full rounded-full border-4 border-[#1E2533] bg-[#181D28] shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden relative">
        <motion.div
          ref={wheelRef}
          animate={controls}
          className="w-full h-full relative"
          style={{ transformOrigin: 'center center' }}
        >
          {options.map((option, index) => {
            const rotation = index * sliceAngle;
            return (
              <div
                key={index}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 origin-bottom flex flex-col items-center justify-start pt-4"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  backgroundColor: 'transparent'
                }}
              >
                <div
                  className="absolute inset-0 origin-bottom"
                  style={{
                    backgroundColor: colors[index % colors.length],
                    transform: `skewX(${90 - sliceAngle}deg)`,
                    transformOrigin: 'bottom left',
                    opacity: 0.15,
                    borderRight: '1px solid rgba(255,255,255,0.05)'
                  }}
                />
                <span
                  className="text-xs font-black text-[#F5F7FA] -rotate-90 origin-bottom whitespace-nowrap w-24 text-right truncate drop-shadow-md z-10"
                  style={{ transform: `translateY(-50%) rotate(-90deg)` }}
                >
                  {option.title}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Center Button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#bd3191] hover:bg-[#7d0d5a] border-4 border-[#1E2533] rounded-full text-white font-black text-sm uppercase tracking-wider shadow-xl transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-20 flex items-center justify-center cursor-pointer"
      >
        ÇEVİR
      </button>
    </div>
  );
}
