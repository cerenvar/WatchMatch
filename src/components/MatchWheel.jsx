import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function MatchWheel({ options, onSelect }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  const wheelRef = useRef(null);

  const colors = [
    '#5ca4a7', // Tiffany Mavisi
    '#f4ac5c', // Altın
    '#ccb494', // Kum/Gold
    '#076465', // Koyu Tiffany
    '#ed9954'  // Sıcak Altın
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
      <div className="w-full h-full rounded-full border-4 border-[#182e33] bg-[#0b1517] shadow-[0_0_40px_rgba(92,164,167,0.15)] overflow-hidden relative">
        <motion.div
          ref={wheelRef}
          animate={controls}
          className="w-full h-full relative"
          style={{ transformOrigin: 'center center' }}
        >
          {options.map((option, index) => {
            const rotation = index * sliceAngle;
            const textRotation = rotation + sliceAngle / 2;
            return (
              <React.Fragment key={index}>
                {/* Sector divider line & background wedge */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-1/2 origin-bottom flex flex-col items-center justify-start"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    backgroundColor: 'rgba(92, 164, 167, 0.12)'
                  }}
                >
                  <div
                    className="absolute inset-0 origin-bottom"
                    style={{
                      backgroundColor: colors[index % colors.length],
                      transform: `skewX(${90 - sliceAngle}deg)`,
                      transformOrigin: 'bottom left',
                      opacity: 0.16,
                      width: '120px'
                    }}
                  />
                </div>

                {/* Centered Movie Title Label */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 origin-bottom flex flex-col items-center justify-start text-white"
                  style={{
                    transform: `rotate(${textRotation}deg)`
                  }}
                >
                  <span
                    className="text-[9px] font-black text-[#F5F7FA] absolute top-8 origin-center whitespace-nowrap w-24 text-center truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10"
                    style={{ transform: `rotate(90deg)` }}
                  >
                    {option.title}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </motion.div>
      </div>

      {/* Center Spin Button with Tiffany & Gold Theme */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#5ca4a7] hover:bg-[#076465] text-[#050b0c] hover:text-[#F5F7FA] border-4 border-[#182e33] rounded-full font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(92,164,167,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-20 flex items-center justify-center cursor-pointer"
      >
        ÇEVİR
      </button>
    </div>
  );
}
