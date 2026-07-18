import React, { useState, useEffect } from 'react';
import { Film, Tag, Globe, Star, Clock, MonitorPlay, Image, Video, MessageSquare } from 'lucide-react';

const GENRES = ["Aksiyon", "Komedi", "Dram", "Bilim Kurgu", "Korku", "Gerilim", "Animasyon", "Gizem", "Suç", "Romantik"];
const PLATFORMS = ["Netflix", "Disney+", "Prime Video", "Apple TV"];
const LANGUAGES = ["İngilizce", "Türkçe", "Japonca", "Korece", "Fransızca", "İspanyolca"];

export default function MovieForm({ onSubmit, editingMovie, onCancel }) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [rating, setRating] = useState('8.0');
  const [note, setNote] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [duration, setDuration] = useState('120');
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [poster, setPoster] = useState('');
  const [trailer, setTrailer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMovie) {
      setTitle(editingMovie.title);
      setGenre(editingMovie.genre);
      setRating(editingMovie.rating.toString());
      setNote(editingMovie.note || '');
      setSelectedPlatforms(editingMovie.platforms || []);
      setDuration(editingMovie.duration.toString());
      setLanguage(editingMovie.language || LANGUAGES[0]);
      setPoster(editingMovie.poster || '');
      setTrailer(editingMovie.trailer || '');
      setError('');
    } else {
      resetForm();
    }
  }, [editingMovie]);

  const resetForm = () => {
    setTitle('');
    setGenre(GENRES[0]);
    setRating('8.0');
    setNote('');
    setSelectedPlatforms([]);
    setDuration('120');
    setLanguage(LANGUAGES[0]);
    setPoster('');
    setTrailer('');
    setError('');
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Lütfen film/dizi adını boş bırakmayın!");
      return;
    }
    setError('');
    const defaultPoster = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
    onSubmit({
      title: title.trim(),
      genre,
      rating: parseFloat(rating) || 7.0,
      note: note.trim(),
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ["Diğer"],
      duration: parseInt(duration) || 120,
      language,
      poster: poster.trim() || defaultPoster,
      trailer: trailer.trim() || "https://www.youtube.com"
    });
    resetForm();
  };

  const getPlatformChipStyle = (platform, isSelected) => {
    if (!isSelected) return 'bg-[#181D28] text-[#9CA3AF] border-[#1E2533] hover:text-[#F5F7FA]';
    switch (platform) {
      case 'Netflix': return 'bg-red-900/25 text-red-400 border-red-900/40';
      case 'Disney+': return 'bg-blue-900/25 text-blue-400 border-blue-900/40';
      case 'Prime Video': return 'bg-sky-900/25 text-sky-400 border-sky-900/40';
      case 'Apple TV': return 'bg-neutral-800/50 text-neutral-300 border-neutral-700/40';
      default: return 'bg-[#bd3191]/10 text-[#bd3191] border-[#bd3191]/30';
    }
  };

  const inputClass = "w-full px-4 py-3 text-sm rounded-xl bg-[#181D28] border border-[#1E2533] focus:outline-none focus:border-[#bd3191] focus:ring-1 focus:ring-[#bd3191]/20 text-[#F5F7FA] placeholder-[#4B5563] transition";
  const labelClass = "flex items-center gap-2 text-xs font-semibold text-[#9CA3AF]";

  return (
    <form onSubmit={handleSubmit} className="bg-[#11151E] border border-[#1E2533] p-6 rounded-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2533] pb-4">
        <h3 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
          <Film className="w-5 h-5 text-[#bd3191]" />
          {editingMovie ? 'Filmi Güncelle' : 'Yeni Film Ekle'}
        </h3>
        {editingMovie && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#F59E0B]/10 text-[#F59E0B]">
            Düzenleme
          </span>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className={labelClass}>
          <Film className="w-4 h-4" /> Film / Dizi Adı
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setError(''); }}
          placeholder="Örn: Interstellar"
          className={inputClass}
          required
        />
        {error && <p className="text-sm text-[#EF4444] font-semibold">{error}</p>}
      </div>

      {/* Genre & Language */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClass}>
            <Tag className="w-4 h-4" /> Tür
          </label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            <Globe className="w-4 h-4" /> Dil
          </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Rating & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClass}>
            <Star className="w-4 h-4 text-[#F59E0B]" /> IMDb Puanı
          </label>
          <input type="number" min="1.0" max="10.0" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className={inputClass} required />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            <Clock className="w-4 h-4" /> Süre (dk)
          </label>
          <input type="number" min="1" max="600" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} required />
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <label className={labelClass}>
          <MonitorPlay className="w-4 h-4" /> Platformlar
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map(p => {
            const isSelected = selectedPlatforms.includes(p);
            return (
              <button
                type="button"
                key={p}
                onClick={() => handlePlatformToggle(p)}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${getPlatformChipStyle(p, isSelected)}`}
              >
                {isSelected ? '✓' : '+'} {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Poster & Trailer URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelClass}>
            <Image className="w-4 h-4" /> Afiş URL
          </label>
          <input type="url" value={poster} onChange={(e) => setPoster(e.target.value)} placeholder="https://..." className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>
            <Video className="w-4 h-4" /> Fragman URL
          </label>
          <input type="url" value={trailer} onChange={(e) => setTrailer(e.target.value)} placeholder="https://youtube.com/..." className={inputClass} />
        </div>
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className={labelClass}>
          <MessageSquare className="w-4 h-4" /> Özet / Not
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Film hakkında kısa açıklama..."
          rows="3"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-[#bd3191] hover:bg-[#7d0d5a] text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
        >
          {editingMovie ? 'Kaydet' : 'Filmi Ekle'}
        </button>
        {editingMovie && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl bg-[#181D28] border border-[#1E2533] hover:bg-[#1E2533] text-[#9CA3AF] font-bold text-sm transition cursor-pointer"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}