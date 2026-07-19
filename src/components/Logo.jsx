import React from 'react';

/**
 * Premium Logo Component mimicking the reference brand design:
 * Emblem on the left, bold title + subtitle on the right.
 * The emblem uses the original heart-shaped film strip logo image (/logo.png)
 * and dynamically shifts its pink/magenta color to Tiffany Blue using CSS filters.
 */
export default function Logo({ size = 'md', subtitle = 'BİRLİKTE KEŞFEDİN' }) {
  const iconSize = size === 'sm' ? 'w-10 h-10 md:w-12 md:h-12' : size === 'lg' ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28' : 'w-12 h-12 md:w-16 md:h-16';
  const titleSize = size === 'sm' ? 'text-xl md:text-2xl' : size === 'lg' ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl md:text-3xl';
  const subtitleSize = size === 'sm' ? 'text-[9px] md:text-[10px]' : size === 'lg' ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[10px] md:text-xs';
  const gap = size === 'sm' ? 'gap-2 md:gap-3' : size === 'lg' ? 'gap-3 sm:gap-4 md:gap-6' : 'gap-3 md:gap-4';

  return (
    <div className={`flex items-center ${gap} select-none`}>
      {/* Custom Uploaded Cinematic Film Strip Logo */}
      <img
        src="/logo.png"
        className={`${iconSize} shrink-0 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_25px_rgba(92,164,167,0.6)]`}
        style={{
          filter: 'saturate(1.15) brightness(1.05)',
        }}
        alt="WatchMatch Heart Emblem"
      />

      {/* Brand Name & Subtitle Block */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`${titleSize} font-black tracking-tight text-white flex items-center`}>
          <span>Watch</span>
          <span className="text-[#5ca4a7]">Match</span>
        </div>
        <div className={`${subtitleSize} font-black text-[#ccb494] tracking-widest uppercase mt-1.5 opacity-85`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
