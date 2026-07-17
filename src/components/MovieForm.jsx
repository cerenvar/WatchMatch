import React, { useState, useEffect } from 'react';

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
      setRating(editingMovie.rating);
      setNote(editingMovie.note);
      setSelectedPlatforms(editingMovie.platforms || []);
      setDuration(editingMovie.duration?.toString() || '120');
      setLanguage(editingMovie.language || LANGUAGES[0]);
      setPoster(editingMovie.poster || '');
      setTrailer(editingMovie.trailer || '');
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
  };

  const handlePlatformToggle = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
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

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl space-y-4 text-white">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
          {editingMovie ? '🎬 Filmi Güncelle' : '🍿 Yeni Film Ekle'}
        </h3>
        {editingMovie && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Düzenleme Modu
          </span>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Film / Dizi Adı</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setError('');
          }}
          placeholder="Örn: Interstellar"
          className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white placeholder-gray-600 transition"
          required
        />
        {error && <p className="text-[10px] text-red-500 font-bold mt-1.5">{error}</p>}
      </div>

      {/* Tür ve Dil */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Tür</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white transition"
          >
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Dil</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white transition"
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* IMDb Puanı ve Süre */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">IMDb Puanı</label>
          <input
            type="number"
            min="1.0"
            max="10.0"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white transition"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Süre (Dakika)</label>
          <input
            type="number"
            min="1"
            max="600"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white transition"
            required
          />
        </div>
      </div>

      {/* Platform Seçimi */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">İzlenebilecek Platformlar</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => {
            const isSelected = selectedPlatforms.includes(p);
            return (
              <button
                type="button"
                key={p}
                onClick={() => handlePlatformToggle(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border cursor-pointer ${isSelected
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-gray-950 text-gray-500 border-gray-800 hover:text-gray-300'
                  }`}
              >
                {isSelected ? '✓' : '+'} {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Poster ve Fragman Linkleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Afiş Görsel URL</label>
          <input
            type="url"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white placeholder-gray-700 text-xs transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Fragman YouTube URL</label>
          <input
            type="url"
            value={trailer}
            onChange={(e) => setTrailer(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white placeholder-gray-700 text-xs transition"
          />
        </div>
      </div>

      {/* Konu / Not */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Özet veya Kişisel Not</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Film konusu veya neden izlenmesi gerektiği hakkında kısa açıklama..."
          rows="3"
          className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-800 focus:outline-none focus:border-sky-500 text-white placeholder-gray-700 text-xs resize-none transition"
        ></textarea>
      </div>

      {/* Butonlar */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition text-white font-bold py-2.5 rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer"
        >
          {editingMovie ? 'Değişiklikleri Kaydet' : 'Filmi Havuza Ekle'}
        </button>
        {editingMovie && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition cursor-pointer"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}