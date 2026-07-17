import React from 'react';

export default function MovieCard({ movie, onDelete, onEdit }) {
  // Helper to determine badge color depending on platform
  const getPlatformStyle = (platform) => {
    switch (platform.toLowerCase()) {
      case 'netflix':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'disney+':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'prime video':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'apple tv':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="group relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/5 transition duration-300 flex flex-col h-full text-white">
      {/* Poster Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-950 flex items-center justify-center">
        {/* Blurred background to prevent black borders */}
        <img
          src={movie.poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-105 pointer-events-none select-none"
        />
        {/* Centered non-cropped poster */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="relative h-full max-w-full object-contain group-hover:scale-102 transition duration-500 z-10"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-85 z-20" />

        {/* Float Rating Badge */}
        <div className="absolute top-3 left-3 bg-gray-950/85 backdrop-blur-md border border-yellow-500/30 text-yellow-450 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-lg z-30">
          <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <span>{movie.rating}</span>
        </div>

        {/* Float Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-gray-950/85 backdrop-blur-md text-gray-300 text-[10px] px-2.5 py-1 rounded-xl border border-gray-800 flex items-center gap-1.5 shadow-md z-30">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4" />
          </svg>
          <span>{movie.duration} dk</span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex justify-between items-start gap-2 mb-2">
            <h4 className="font-bold text-lg text-sky-200 line-clamp-1 group-hover:text-sky-400 transition">
              {movie.title}
            </h4>
            <span className="shrink-0 bg-sky-500/10 text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-sky-500/25">
              {movie.genre}
            </span>
          </div>

          {/* Secondary metadata */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[10px] text-gray-400 border border-gray-800 bg-gray-950 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <span>{movie.language}</span>
            </span>
            {movie.platforms && movie.platforms.map((platform, idx) => (
              <span
                key={idx}
                className={`text-[9px] font-bold border px-1.5 py-0.5 rounded ${getPlatformStyle(platform)}`}
              >
                {platform}
              </span>
            ))}
          </div>

          {/* Personal note / Synopsis */}
          {movie.note && (
            <div className="max-h-24 overflow-y-auto mb-4 bg-gray-950/50 p-3 rounded-xl border border-gray-850 text-left scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              <p className="text-xs text-gray-400 italic leading-relaxed">
                "{movie.note}"
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 mt-auto">
          {/* YouTube Trailer */}
          {movie.trailer ? (
            <a
              href={movie.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-450 hover:text-red-400 transition flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current text-red-500 shrink-0" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Fragman İzle</span>
            </a>
          ) : (
            <span className="text-xs text-gray-650 flex items-center gap-1">Fragman Yok</span>
          )}

          {/* CRUD Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(movie)}
              className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/10 transition cursor-pointer"
              title="Düzenle"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(movie.id)}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/10 transition cursor-pointer"
              title="Sil"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}