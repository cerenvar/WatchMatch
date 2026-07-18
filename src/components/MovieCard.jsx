import React from 'react';
import { Star, Clock, Globe, Play, Pencil, Trash2 } from 'lucide-react';

export default function MovieCard({ movie, onDelete, onEdit }) {
  const getPlatformStyle = (platform) => {
    switch (platform.toLowerCase()) {
      case 'netflix':
        return 'bg-red-900/25 text-red-400';
      case 'disney+':
        return 'bg-blue-900/25 text-blue-400';
      case 'prime video':
        return 'bg-sky-900/25 text-sky-400';
      case 'apple tv':
        return 'bg-neutral-800/60 text-neutral-300';
      default:
        return 'bg-[#181D28] text-[#9CA3AF]';
    }
  };

  return (
    <div className="group bg-[#11151E]/55 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#bd3191]/5 flex flex-col h-full border border-[#1E2533] hover:border-[#bd3191]/30">
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181D28]/60">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#11151E] via-transparent to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-sm px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
          <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
          <span className="text-[#F5F7FA]">{movie.rating}</span>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 text-[#E5E7EB]">
          <Clock className="w-3.5 h-3.5" />
          <span>{movie.duration} dk</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h4 className="font-bold text-lg text-[#F5F7FA] line-clamp-1 group-hover:text-white transition">
            {movie.title}
          </h4>
          <span className="shrink-0 bg-[#181D28] text-[#9CA3AF] text-xs px-2.5 py-1 rounded-md font-semibold">
            {movie.genre}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-[#9CA3AF] flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5" />
            {movie.language}
          </span>
          {movie.platforms && movie.platforms.map((platform, idx) => (
            <span
              key={idx}
              className={`text-xs font-semibold px-2 py-1 rounded-md ${getPlatformStyle(platform)}`}
            >
              {platform}
            </span>
          ))}
        </div>

        {/* Synopsis */}
        {movie.note && (
          <div className="max-h-24 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-[#1E2533] scrollbar-track-transparent pr-2">
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {movie.note}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1E2533] pt-4 mt-auto">
          {movie.trailer ? (
            <a
              href={movie.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Fragman
            </a>
          ) : (
            <span className="text-sm text-[#4B5563] font-medium">Fragman Yok</span>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(movie)}
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition cursor-pointer"
              title="Düzenle"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(movie.id)}
              className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}