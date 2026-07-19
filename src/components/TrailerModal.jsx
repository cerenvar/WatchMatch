import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Premium Trailer Modal component that plays YouTube embed trailers.
 * If the movie is fetched from TMDb and doesn't have a valid static trailer,
 * it queries TMDb's videos endpoint in the background to fetch a working trailer key.
 */
export default function TrailerModal({ isOpen, onClose, movie }) {
  const [loading, setLoading] = useState(false);
  const [dynamicVideoId, setDynamicVideoId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setDynamicVideoId('');
      return;
    }

    const isTmdbMovie = movie?.id && movie.id.startsWith('tmdb_');
    const isPlaceholder = !movie?.trailer || movie.trailer === 'https://www.youtube.com' || (!movie.trailer.includes('watch?v=') && !movie.trailer.includes('youtu.be/'));

    if (isTmdbMovie && isPlaceholder) {
      const tmdbId = movie.id.replace('tmdb_', '');
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;

      if (!apiKey) return;

      setLoading(true);
      // Try to fetch Turkish trailer
      fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${apiKey}&language=tr-TR`)
        .then(r => r.json())
        .then(data => {
          const video = data.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer');
          if (video) {
            setDynamicVideoId(video.key);
            setLoading(false);
          } else {
            // Fallback to English trailer
            fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${apiKey}&language=en-US`)
              .then(r => r.json())
              .then(dataEn => {
                const videoEn = dataEn.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
                if (videoEn) {
                  setDynamicVideoId(videoEn.key);
                }
                setLoading(false);
              })
              .catch(err => {
                console.error("Failed to fetch EN video:", err);
                setLoading(false);
              });
          }
        })
        .catch(err => {
          console.error("Failed to fetch TR video:", err);
          setLoading(false);
        });
    }
  }, [isOpen, movie]);

  if (!isOpen) return null;

  // Extract static YouTube video ID if no dynamic one was fetched
  let videoId = dynamicVideoId;
  if (!videoId && movie?.trailer) {
    const match = movie.trailer.match(/[?&]v=([^&]+)/);
    if (match) videoId = match[1];
    else if (movie.trailer.includes('youtu.be/')) {
      videoId = movie.trailer.split('youtu.be/')[1].split('?')[0];
    }
  }

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0b1517] rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center text-white border border-white/[0.05] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video w-full bg-[#050b0c] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#5ca4a7] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-semibold text-gray-400">Fragman Yükleniyor...</div>
            </div>
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="text-center p-8 max-w-md">
              <p className="text-gray-300 mb-5 font-semibold text-sm">Bu film için gömülü YouTube fragmanı bulunamadı.</p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent((movie?.title || '') + ' Fragman')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
              >
                YouTube'da Ara 🔍
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
