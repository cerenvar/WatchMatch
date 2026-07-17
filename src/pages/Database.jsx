import React, { useState } from 'react';
import MovieForm from '../components/MovieForm';
import MovieCard from '../components/MovieCard';

export default function Database({
  movies,
  onSubmitMovie,
  onDeleteMovie,
  editingMovie,
  setEditingMovie,
  resetToDefaults,
  confirmAction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Get list of unique genres in database to filter by
  const uniqueGenres = Array.from(new Set(movies.map(m => m.genre)));

  // Filter movies based on search term and selected genre
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.note?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre ? movie.genre === selectedGenre : true;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="max-w-6xl mx-auto my-6 text-white px-4">
      {/* Header section */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-2">⚙️</span>
        <h2 className="text-3xl font-black bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Film Kütüphanem (CRUD)
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Eşleşme havuzundaki filmleri yönetin. Yeni film ekleyin, güncelleyin veya silin! 🍿
        </p>
      </div>

      {/* Bilgilendirme Kutusu */}
      <div className="bg-sky-500/10 border border-sky-500/25 p-4 rounded-2xl mb-8 flex items-start gap-3 max-w-3xl mx-auto">
        <span className="text-2xl shrink-0">💡</span>
        <div className="text-xs text-sky-200 leading-relaxed text-left">
          <span className="font-bold block text-sm text-sky-300 mb-0.5">Önemli Bilgi</span>
          Burası sizin <strong>kişisel film listenizdir</strong>. Burada film eklemeniz veya silmeniz, arkadaşlarınızın telefonundaki film listelerini <strong>asla etkilemez veya bozmaz</strong>. Değişiklikler sadece sizin tarayıcınızda saklanır. Yanlışlıkla bir şeyi silerseniz veya karıştırırsanız, sol taraftaki <strong>"Örnek Filmleri Geri Yükle"</strong> butonuna basarak her şeyi ilk haline geri döndürebilirsiniz.
        </div>
      </div>

      {/* Grid structure: Left form, Right list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Movie Form (Create/Update) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24">
            <MovieForm
              onSubmit={onSubmitMovie}
              editingMovie={editingMovie}
              onCancel={() => setEditingMovie(null)}
            />

            {/* Seed restorer */}
            <div className="mt-4 p-4 bg-gray-900 border border-gray-800 rounded-2xl text-center space-y-2">
              <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">İlk Listeye Geri Dön 🧹</span>
              <p className="text-[10px] text-gray-400">
                Kendi eklediğiniz filmleri silip, uygulamanın önerdiği ilk 15 hazır filme geri dönmek isterseniz bu düğmeyi kullanabilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => {
                  confirmAction(
                    "Eklediğiniz tüm filmler silinecek ve uygulamanın kendi hazır örnek filmleri geri yüklenecek. Devam etmek istiyor musunuz?",
                    () => {
                      resetToDefaults();
                      setEditingMovie(null);
                    },
                    "Kütüphaneyi Sıfırla 🧹"
                  );
                }}
                className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold rounded-xl border border-purple-500/20 text-xs transition cursor-pointer"
              >
                🍿 Örnek Filmleri Geri Yükle
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: List & Filters (Read/Delete) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search and Filters panel */}
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
            <div className="w-full md:flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Film adı veya notlarda ara..."
                className="w-full px-4 py-2 rounded-xl bg-gray-950 border border-gray-850 text-xs focus:outline-none focus:border-sky-500 text-white placeholder-gray-600 transition"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-850 text-xs focus:outline-none focus:border-sky-500 text-white transition text-gray-450"
              >
                <option value="">Tüm Türler</option>
                {uniqueGenres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Database Counter */}
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Toplam Film: {movies.length} {filteredMovies.length !== movies.length && `(Filtrelenmiş: ${filteredMovies.length})`}
            </span>
          </div>

          {/* Grid listing */}
          {filteredMovies.length === 0 ? (
            <div className="bg-gray-900 border border-dashed border-gray-800 rounded-3xl p-16 text-center text-gray-500 shadow-md">
              <span className="text-4xl block mb-2">🎬</span>
              <p className="text-sm font-semibold">Aradığınız kriterlere uygun film bulunamadı.</p>
              <p className="text-xs text-gray-600 mt-1">Arama kelimenizi temizleyin veya sol taraftan yenisini ekleyin.</p>
              {(searchTerm || selectedGenre) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedGenre(''); }}
                  className="mt-4 text-xs font-bold text-sky-400 hover:underline"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onDelete={onDeleteMovie}
                  onEdit={setEditingMovie}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
