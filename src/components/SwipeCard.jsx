import React, { useState, useEffect, useRef } from 'react';

export default function SwipeCard({ movie, onVote }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState('');
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  // Reset card offset on movie change
  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setTransition('');
  }, [movie]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    setTransition('none');
    
    // Capture pointer to track dragging outside card boundaries
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDrag({ x: deltaX, y: deltaY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.releasePointerCapture(e.pointerId);
    }

    const threshold = 120;
    setTransition('transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)');

    if (drag.x > threshold) {
      // Swipe Right -> Like
      setDrag({ x: 500, y: drag.y });
      setTimeout(() => onVote(movie.id, 'like'), 200);
    } else if (drag.x < -threshold) {
      // Swipe Left -> Dislike
      setDrag({ x: -500, y: drag.y });
      setTimeout(() => onVote(movie.id, 'dislike'), 200);
    } else if (drag.y < -threshold) {
      // Swipe Up -> Neutral
      setDrag({ x: drag.x, y: -500 });
      setTimeout(() => onVote(movie.id, 'neutral'), 200);
    } else {
      // Return to center
      setDrag({ x: 0, y: 0 });
    }
  };

  const handleVoteClick = (voteType) => {
    setTransition('transform 0.3s ease-in-out');
    if (voteType === 'like') {
      setDrag({ x: 500, y: 0 });
      setTimeout(() => onVote(movie.id, 'like'), 150);
    } else if (voteType === 'dislike') {
      setDrag({ x: -500, y: 0 });
      setTimeout(() => onVote(movie.id, 'dislike'), 150);
    } else {
      setDrag({ x: 0, y: -500 });
      setTimeout(() => onVote(movie.id, 'neutral'), 150);
    }
  };

  // Calculate opacity/scale for indicators
  const likeOpacity = Math.min(Math.max(drag.x / 100, 0), 1);
  const dislikeOpacity = Math.min(Math.max(-drag.x / 100, 0), 1);
  const neutralOpacity = Math.min(Math.max(-drag.y / 100, 0), 1);

  const cardStyle = {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.08}deg)`,
    transition: transition,
    touchAction: 'none', // Prevents default browser scrolling while swiping
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
      {/* Swipe Container */}
      <div 
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={cardStyle}
        className={`relative w-full aspect-[2/3] bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing flex flex-col justify-end text-white select-none ${
          isDragging ? 'scale-[1.01]' : 'transition-transform duration-300'
        }`}
      >
        {/* Movie Poster Background */}
        {/* Blurred background bokeh */}
        <img 
          src={movie.poster} 
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none"
        />
        {/* Clean centered uncropped poster */}
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
          }}
        />

        {/* Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/45 to-gray-950/20 pointer-events-none z-20" />

        {/* Swipe Choice Overlays */}
        {likeOpacity > 0 && (
          <div 
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-6 border-4 border-emerald-500 text-emerald-400 font-extrabold text-2xl uppercase px-4 py-2 rounded-xl rotate-[-12deg] tracking-widest bg-emerald-950/90 pointer-events-none shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <span>BEĞENDİM</span>
            <svg className="w-6 h-6 text-emerald-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}
        {dislikeOpacity > 0 && (
          <div 
            style={{ opacity: dislikeOpacity }}
            className="absolute top-10 right-6 border-4 border-rose-500 text-rose-400 font-extrabold text-2xl uppercase px-4 py-2 rounded-xl rotate-[12deg] tracking-widest bg-rose-950/90 pointer-events-none shadow-lg shadow-rose-500/20 flex items-center gap-2"
          >
            <span>İSTEMİYORUM</span>
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
        )}
        {neutralOpacity > 0 && (
          <div 
            style={{ opacity: neutralOpacity }}
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-amber-500 text-amber-400 font-extrabold text-2xl uppercase px-4 py-2 rounded-xl tracking-widest bg-amber-950/90 pointer-events-none shadow-lg shadow-amber-500/20 text-center flex items-center gap-2 whitespace-nowrap"
          >
            <span>KARARSIZIM</span>
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 15h8M9 9h.01M15 9h.01"/>
            </svg>
          </div>
        )}

        {/* Top Floating Badge */}
        <div className="absolute top-4 right-4 bg-gray-950/80 backdrop-blur-md border border-yellow-500/25 text-yellow-450 text-sm px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xl pointer-events-none">
          <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span>{movie.rating}</span>
        </div>

        {/* Movie Info Overlay */}
        <div className="relative p-6 space-y-3 pointer-events-none z-30">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="bg-sky-500/80 backdrop-blur-md text-white text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border border-sky-400/25 shadow-lg tracking-wider">
              {movie.genre}
            </span>
            <span className="bg-gray-950/85 backdrop-blur-md text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-800 shadow-md flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4"/>
              </svg>
              <span>{movie.duration} dk</span>
            </span>
            <span className="bg-gray-950/85 backdrop-blur-md text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-800 shadow-md flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-405" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              <span>{movie.language}</span>
            </span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {movie.title}
          </h2>

          <div className="flex flex-wrap gap-1.5 py-1">
            {movie.platforms && movie.platforms.map((platform, idx) => (
              <span 
                key={idx} 
                className="text-[9px] font-black tracking-wider uppercase bg-white/10 text-white backdrop-blur-sm border border-white/15 px-2 py-0.5 rounded"
              >
                {platform}
              </span>
            ))}
          </div>

          {movie.note && (
            <div className="max-h-24 overflow-y-auto mb-1 pointer-events-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <p className="text-xs text-gray-200 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {movie.note}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Swipe Action Buttons */}
      <div className="flex items-center gap-6 mt-6 w-full justify-center">
        {/* Dislike */}
        <button
          onClick={() => handleVoteClick('dislike')}
          className="w-14 h-14 rounded-full bg-gray-900 border border-gray-850 text-rose-500 flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-lg hover:shadow-rose-500/15 hover:border-rose-500/40 cursor-pointer"
          title="İstemiyorum (Sol)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        {/* Neutral */}
        <button
          onClick={() => handleVoteClick('neutral')}
          className="w-12 h-12 rounded-full bg-gray-900 border border-gray-850 text-amber-500 flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-lg hover:shadow-amber-500/15 hover:border-amber-500/40 cursor-pointer"
          title="Kararsızım (Yukarı)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 15h8M9 9h.01M15 9h.01"/>
          </svg>
        </button>
        {/* Like */}
        <button
          onClick={() => handleVoteClick('like')}
          className="w-14 h-14 rounded-full bg-gray-900 border border-gray-850 text-emerald-500 flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-lg hover:shadow-emerald-500/15 hover:border-emerald-500/40 cursor-pointer"
          title="Beğendim (Sağ)"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      {/* Swipe Helper Guide */}
      <div className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest mt-4 flex items-center gap-2">
        <span>Sola: ❌ İstemiyorum</span>
        <span>•</span>
        <span>Yukarı: 😐 Kararsızım</span>
        <span>•</span>
        <span>Sağa: ❤️ Beğendim</span>
      </div>
    </div>
  );
}
