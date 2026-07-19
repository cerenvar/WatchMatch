import React from 'react';

/**
 * Premium Logo Component mimicking the reference brand design:
 * Emblem on the left, bold title + subtitle on the right.
 * The emblem uses the original heart-shaped film strip logo image (/logo.png)
 * and dynamically shifts its pink/magenta color to Tiffany Blue using CSS filters.
 */
export default function Logo({ size = 'md', subtitle = 'BİRLİKTE KEŞFEDİN' }) {
  const iconSize = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-28 h-28' : 'w-16 h-16';
  const titleSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-5xl' : 'text-3xl';
  const subtitleSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const gap = size === 'sm' ? 'gap-3' : size === 'lg' ? 'gap-6' : 'gap-4';

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
