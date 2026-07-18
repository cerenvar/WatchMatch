import TrailerModal from './TrailerModal';
import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Minus, Star, Clock, Globe } from 'lucide-react';

export default function SwipeCard({ movie, onVote }) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [transition, setTransition] = useState('');
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    setTransition('');
  }, [movie]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    setTransition('none');
    if (cardRef.current) cardRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setDrag({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (cardRef.current) cardRef.current.releasePointerCapture(e.pointerId);
    const threshold = 120;
    setTransition('transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)');

    if (drag.x > threshold) {
      setDrag({ x: 500, y: drag.y });
      setTimeout(() => onVote(movie.id, 'like'), 200);
    } else if (drag.x < -threshold) {
      setDrag({ x: -500, y: drag.y });
      setTimeout(() => onVote(movie.id, 'dislike'), 200);
    } else if (drag.y < -threshold) {
      setDrag({ x: drag.x, y: -500 });
      setTimeout(() => onVote(movie.id, 'neutral'), 200);
    } else {
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

  const likeOpacity = Math.min(Math.max(drag.x / 100, 0), 1);
  const dislikeOpacity = Math.min(Math.max(-drag.x / 100, 0), 1);
  const neutralOpacity = Math.min(Math.max(-drag.y / 100, 0), 1);

  const cardStyle = {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.08}deg)`,
    transition,
    touchAction: 'none',
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto select-none">
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={cardStyle}
          className={`relative w-auto h-[45vh] max-h-[420px] aspect-[2/3] mx-auto bg-[#11151E]/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl shadow-black/50 cursor-grab active:cursor-grabbing flex flex-col justify-end select-none border border-[#bd3191]/15 hover:border-[#bd3191]/30 transition-colors duration-300 ${isDragging ? 'scale-[1.01]' : 'transition-transform duration-300'
            }`}
        >
          {/* Poster */}
          <img
            src={movie.poster}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />

          {/* Trailer Button Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTrailer(true); }}
              aria-label="Fragmanı İzle"
              className="w-20 h-20 bg-[#bd3191]/25 backdrop-blur-md rounded-full flex items-center justify-center border border-[#bd3191]/50 hover:bg-[#bd3191]/40 transition-all shadow-[0_0_35px_rgba(189,49,145,0.3)] hover:scale-110 duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white ml-2">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Swipe indicators */}
          {likeOpacity > 0 && (
            <div style={{ opacity: likeOpacity }} className="absolute top-10 left-6 border-4 border-[#22C55E] text-[#22C55E] font-black text-2xl uppercase px-5 py-3 rounded-2xl rotate-[-12deg] tracking-wider bg-[#22C55E]/20 backdrop-blur-md pointer-events-none flex items-center gap-2 z-30 shadow-xl shadow-[#22C55E]/20">
              <Heart className="w-6 h-6 fill-current" />
              <span>Beğendim</span>
            </div>
          )}
          {dislikeOpacity > 0 && (
            <div style={{ opacity: dislikeOpacity }} className="absolute top-10 right-6 border-4 border-[#EF4444] text-[#EF4444] font-black text-2xl uppercase px-5 py-3 rounded-2xl rotate-[12deg] tracking-wider bg-[#EF4444]/20 backdrop-blur-md pointer-events-none flex items-center gap-2 z-30 shadow-xl shadow-[#EF4444]/20">
              <X className="w-6 h-6" strokeWidth={4} />
              <span>Geç</span>
            </div>
          )}
          {neutralOpacity > 0 && (
            <div style={{ opacity: neutralOpacity }} className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 border-4 border-[#F59E0B] text-[#F59E0B] font-black text-2xl uppercase px-5 py-3 rounded-2xl tracking-wider bg-[#F59E0B]/20 backdrop-blur-md pointer-events-none flex items-center gap-2 whitespace-nowrap z-30 shadow-xl shadow-[#F59E0B]/20">
              <Minus className="w-6 h-6" strokeWidth={4} />
              <span>Kararsız</span>
            </div>
          )}

          {/* Rating */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-base px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 pointer-events-none z-20 shadow-lg">
            <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-[#F5F7FA]">{movie.rating}</span>
          </div>

          {/* Movie info */}
          <div className="relative p-6 space-y-3 pointer-events-none z-20">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="bg-[#bd3191]/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                {movie.genre}
              </span>
              <span className="bg-black/60 backdrop-blur-md text-[#E5E7EB] text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                {movie.duration} dk
              </span>
              <span className="bg-black/60 backdrop-blur-md text-[#E5E7EB] text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                {movie.language}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white leading-tight drop-shadow-xl">
              {movie.title}
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {movie.platforms && movie.platforms.map((platform, idx) => (
                <span key={idx} className="text-xs font-bold bg-white/15 text-white backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-white/10">
                  {platform}
                </span>
              ))}
            </div>

            {movie.note && (
              <div className="max-h-24 overflow-y-auto pointer-events-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent pr-2">
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  {movie.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-6 mt-6 w-full justify-center">
          <button
            onClick={() => handleVoteClick('dislike')}
            aria-label="Geç"
            className="w-14 h-14 rounded-full bg-[#11151E] border-2 border-[#1E2533] text-[#EF4444] flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer hover:border-[#EF4444]/40 shadow-lg"
            title="Geç"
          >
            <X className="w-6 h-6" strokeWidth={3} />
          </button>
          <button
            onClick={() => handleVoteClick('neutral')}
            aria-label="Kararsız"
            className="w-12 h-12 rounded-full bg-[#11151E] border-2 border-[#1E2533] text-[#F59E0B] flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer hover:border-[#F59E0B]/40 shadow-lg"
            title="Kararsız"
          >
            <Minus className="w-5 h-5" strokeWidth={3} />
          </button>
          <button
            onClick={() => handleVoteClick('like')}
            aria-label="Beğendim"
            className="w-14 h-14 rounded-full bg-[#11151E] border-2 border-[#1E2533] text-[#22C55E] flex items-center justify-center hover:scale-110 active:scale-95 transition cursor-pointer hover:border-[#22C55E]/40 shadow-lg"
            title="Beğendim"
          >
            <Heart className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Helper text */}
        <div className="text-xs text-[#9CA3AF] font-semibold mt-4 flex items-center gap-4 bg-[#11151E] px-4 py-2 rounded-xl border border-[#1E2533]">
          <span className="flex items-center gap-1.5"><X className="w-4 h-4 text-[#EF4444]" /> Sola</span>
          <span className="flex items-center gap-1.5"><Minus className="w-4 h-4 text-[#F59E0B]" /> Yukarı</span>
          <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-[#22C55E]" /> Sağa</span>
        </div>
      </div>
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailer}
      />
    </>
  );
}