import React from 'react';
import { X } from 'lucide-react';

export default function TrailerModal({ isOpen, onClose, trailerUrl }) {
  if (!isOpen) return null;

  // Extract YouTube video ID
  let videoId = '';
  if (trailerUrl) {
    const match = trailerUrl.match(/[?&]v=([^&]+)/);
    if (match) videoId = match[1];
    else if (trailerUrl.includes('youtu.be/')) {
      videoId = trailerUrl.split('youtu.be/')[1].split('?')[0];
    }
  }

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#11151E] rounded-2xl overflow-hidden border border-[#1E2533] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="aspect-video w-full bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="text-gray-400">Fragman bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}
