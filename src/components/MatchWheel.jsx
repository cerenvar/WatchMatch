import React, { useState } from 'react';

export default function MatchWheel({ matchedMovies, onClose }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayText, setDisplayText] = useState('Döndürmeye Hazır!');
  const [finalChoice, setFinalChoice] = useState(null);

  const startSpin = () => {
    if (matchedMovies.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setFinalChoice(null);

    let counter = 0;
    let speed = 40; // Initial speed in ms
    const maxSpins = 30; // Number of items it cycles through before stopping
    
    const pickRandomSequence = () => {
      const randomIndex = Math.floor(Math.random() * matchedMovies.length);
      const tempMovie = matchedMovies[randomIndex];
      setDisplayText(tempMovie.title);
      
      counter++;
      
      if (counter < maxSpins) {
        // Slow down physics
        if (counter > maxSpins * 0.7) {
          speed += 40;
        } else if (counter > maxSpins * 0.4) {
          speed += 20;
        }
        setTimeout(pickRandomSequence, speed);
      } else {
        // Spin finished
        setIsSpinning(false);
        setFinalChoice(tempMovie);
      }
    };

    setTimeout(pickRandomSequence, speed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-center text-white flex flex-col items-center">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition text-xl cursor-pointer"
          disabled={isSpinning}
        >
          ✕
        </button>

        {/* Header */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          🎲 Şanslı Seçici
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Karar veremediyseniz, çarkı döndürün ve kadere bırakın!
        </p>

        {/* Slot Reel */}
        <div className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-8 mb-6 relative overflow-hidden flex items-center justify-center min-h-[140px] shadow-inner">
          <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-gray-950 via-transparent to-gray-950 opacity-90" />
          
          <div className={`transition-all duration-100 ${isSpinning ? 'scale-95 text-sky-400 blur-[0.5px]' : 'scale-105 text-white font-extrabold'}`}>
            <span className="text-2xl tracking-tight block max-w-xs break-words">
              {displayText}
            </span>
          </div>
        </div>

        {/* Final Selection Result Card */}
        {finalChoice && (
          <div className="w-full bg-gray-950 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex gap-4 items-center text-left animate-fade-in">
            <img 
              src={finalChoice.poster} 
              alt={finalChoice.title} 
              className="w-16 h-24 object-cover rounded-lg border border-gray-800 shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 mb-1 inline-block">
                Kaderin Seçimi 🔮
              </span>
              <h4 className="font-extrabold text-sky-300 text-base truncate">{finalChoice.title}</h4>
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {finalChoice.note}
              </p>
              <div className="flex gap-2 items-center mt-2">
                <span className="text-[10px] text-yellow-400 font-bold">⭐ {finalChoice.rating}</span>
                <span className="text-[10px] text-gray-500">|</span>
                <span className="text-[10px] text-gray-400">{finalChoice.genre}</span>
              </div>
            </div>
          </div>
        )}

        {/* Spin Actions */}
        <div className="w-full flex gap-3">
          <button
            onClick={startSpin}
            disabled={isSpinning || matchedMovies.length === 0}
            className={`flex-1 font-bold py-3 px-6 rounded-xl transition shadow-lg cursor-pointer ${
              isSpinning 
                ? 'bg-gray-850 text-gray-600 border border-gray-850'
                : 'bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 text-white shadow-sky-500/10'
            }`}
          >
            {isSpinning ? 'Dönüyor...' : 'Zarları At 🎲'}
          </button>
          
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
