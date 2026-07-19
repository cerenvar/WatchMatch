import React from 'react';

/**
 * Avatar component that renders a Unicode emoji using Twemoji CDN SVGs
 * for cross-platform visual consistency. Falls back to raw Unicode if image fails.
 * 
 * @param {string} emoji The Unicode emoji character (e.g. "🐶")
 * @param {string} className Styling classes for the image
 */
export default function Avatar({ emoji, className = "w-6 h-6 object-contain inline-block" }) {
  if (!emoji) return null;

  // Convert the Unicode emoji into a hex code point string (e.g. 1f436)
  const points = [];
  for (const char of emoji) {
    const code = char.codePointAt(0);
    if (code) points.push(code.toString(16));
  }
  const hex = points.join('-');

  // Twemoji CDN hosted via jsDelivr (SVG files)
  const src = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${hex}.svg`;

  return (
    <span className="inline-flex items-center justify-center shrink-0">
      <img
        src={src}
        alt={emoji}
        className={className}
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
      <span style={{ display: 'none' }} className="select-none">{emoji}</span>
    </span>
  );
}
