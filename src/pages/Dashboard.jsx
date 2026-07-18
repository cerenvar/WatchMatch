import React, { useState, useEffect } from 'react';
import MovieForm from '../components/MovieForm';
import MovieCard from '../components/MovieCard';

export default function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);

  // 1. READ: Sayfa ilk açıldığında LocalStorage'daki verileri oku
  useEffect(() => {
    const savedMovies = localStorage.getItem('film_match_list');
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    }
  }, []);

  // 2. Her liste değiştiğinde LocalStorage'ı güncelle
  const saveToLocalStorage = (newMovies) => {
    setMovies(newMovies);
    localStorage.setItem('film_match_list', JSON.stringify(newMovies));
  };

  // 3. CREATE / UPDATE işlemi
  const handleFormSubmit = (movieData) => {
    if (editingMovie) {
      // UPDATE: Mevcut filmi güncelle
      const updatedMovies = movies.map((m) =>
        m.id === editingMovie.id ? { ...m, ...movieData } : m
      );
      saveToLocalStorage(updatedMovies);
      setEditingMovie(null);
    } else {
      // CREATE: Yeni film ekle
      const newMovie = {
        id: Date.now().toString(),
        ...movieData,
      };
      saveToLocalStorage([newMovie, ...movies]);
    }
  };

  // 4. DELETE işlemi
  const handleDelete = (id) => {
    if (confirm("Bu filmi listenizden silmek istediğinize emin misiniz?")) {
      const filteredMovies = movies.filter((m) => m.id !== id);
      saveToLocalStorage(filteredMovies);
      // Eğer düzenlenen film silindiyse formu temizle
      if (editingMovie?.id === id) {
        setEditingMovie(null);
      }
    }
  };

  // 5. UPDATE: Durumu (İzlendi/İzlenmedi) Değiştirme
  const handleToggleWatched = (id) => {
    const updatedMovies = movies.map((m) =>
      m.id === id ? { ...m, watched: !m.watched } : m
    );
    saveToLocalStorage(updatedMovies);
  };

  // 6. Düzenleme modunu başlatma
  const handleEditInit = (movie) => {
    setEditingMovie(movie);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Bölümü */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            WatchMatch Listem
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-base">
            İzlemek istediğin filmleri listele, durumunu güncelle ve yerel hafızada sakla!
          </p>
        </header>

        {/* Ana İçerik Izgarası (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol Kolon: Form */}
          <div className="md:col-span-1">
            <div className="sticky top-6">
              <MovieForm
                onSubmit={handleFormSubmit}
                editingMovie={editingMovie}
                onCancel={() => setEditingMovie(null)}
              />
            </div>
          </div>

          {/* Sağ Kolon: Listeleme (Read) */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-bold text-gray-200">
                Koleksiyonum ({movies.length})
              </h2>
            </div>

            {movies.length === 0 ? (
              <div className="bg-gray-900 border border-dashed border-gray-800 rounded-2xl p-10 text-center text-gray-500">
                
                Listeniz henüz boş. Sol taraftaki formdan hemen ilk filminizi ekleyin!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onDelete={handleDelete}
                    onEdit={handleEditInit}
                    onToggleWatched={handleToggleWatched}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}