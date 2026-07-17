import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Lobby from './pages/Lobby';
import SwipeArena from './pages/SwipeArena';
import Results from './pages/Results';
import Database from './pages/Database';
import { defaultMovies } from './data/defaultMovies';
import useRoomSync from './hooks/useRoomSync';
import CustomModal from './components/CustomModal';

export default function App() {
  const [page, setPage] = useState('lobby'); // 'lobby' | 'swiper' | 'results' | 'database'
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const triggerConfirm = (message, onConfirm, title = "Emin misiniz?") => {
    setModalConfig({
      title,
      message,
      confirmText: "Tamam",
      cancelText: "İptal",
      onConfirm: () => {
        onConfirm();
        setModalConfig(null);
      },
      onCancel: () => {
        setModalConfig(null);
      }
    });
  };

  const triggerAlert = (message, title = "Bilgi") => {
    setModalConfig({
      title,
      message,
      confirmText: "Tamam",
      onConfirm: () => {
        setModalConfig(null);
      }
    });
  };

  // 1. Initial Load: Read from LocalStorage or seed defaults/TMDb
  useEffect(() => {
    const savedMovies = localStorage.getItem('film_match_list');
    const hasSeededTmdb = localStorage.getItem('film_match_list_tmdb_seeded') === 'true';
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    const seedFromTmdb = async () => {
      try {
        const pagePromises = [];
        const totalPages = 18; // 18 pages * 20 movies = 360 movies
        for (let p = 1; p <= totalPages; p++) {
          pagePromises.push(
            fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=tr-TR&page=${p}`).then(r => r.json())
          );
        }
        const pagesData = await Promise.all(pagePromises);
        const rawMovies = [];
        pagesData.forEach(pData => {
          if (pData.results) {
            rawMovies.push(...pData.results);
          }
        });

        if (rawMovies.length === 0) throw new Error("Empty TMDb results");

        // Map TMDb genre IDs to our Turkish database genres
        const genreMap = {
          28: "Aksiyon", 12: "Aksiyon", 16: "Animasyon", 35: "Komedi", 
          80: "Suç", 99: "Dram", 18: "Dram", 10751: "Animasyon", 
          14: "Bilim Kurgu", 36: "Dram", 27: "Korku", 10402: "Dram", 
          9648: "Gizem", 10749: "Romantik", 878: "Bilim Kurgu", 
          10770: "Dram", 53: "Gerilim", 10752: "Dram", 37: "Aksiyon"
        };

        const getLangName = (lang) => {
          switch (lang) {
            case 'en': return 'İngilizce';
            case 'tr': return 'Türkçe';
            case 'ja': return 'Japonca';
            case 'ko': return 'Korece';
            case 'fr': return 'Fransızca';
            case 'es': return 'İspanyolca';
            default: return 'İngilizce';
          }
        };

        const mapped = rawMovies.map((m) => {
          let mappedGenre = "Aksiyon";
          if (m.genre_ids && m.genre_ids.length > 0) {
            mappedGenre = genreMap[m.genre_ids[0]] || "Aksiyon";
          }

          // Deterministic watch platforms based on movie ID
          const platforms = [];
          if (m.id % 2 === 0) platforms.push('Netflix');
          if (m.id % 3 === 0) platforms.push('Prime Video');
          if (m.id % 5 === 0) platforms.push('Disney+');
          if (m.id % 7 === 0) platforms.push('Apple TV');
          if (platforms.length === 0) platforms.push('Netflix');

          // Deterministic duration based on movie ID
          const duration = 90 + (m.id % 8) * 10;

          return {
            id: `tmdb_${m.id}`,
            title: m.title,
            genre: mappedGenre,
            rating: parseFloat(m.vote_average?.toFixed(1)) || 7.0,
            note: m.overview || 'Konu özeti bulunamadı.',
            platforms: platforms,
            duration: duration,
            language: getLangName(m.original_language),
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
            trailer: 'https://www.youtube.com'
          };
        });

        // Filter duplicates
        const seen = new Set();
        const unique = [];
        mapped.forEach(movie => {
          if (!seen.has(movie.id)) {
            seen.add(movie.id);
            unique.push(movie);
          }
        });

        setMovies(unique);
        localStorage.setItem('film_match_list', JSON.stringify(unique));
        localStorage.setItem('film_match_list_tmdb_seeded', 'true');
      } catch (err) {
        console.error("Otomatik tohumlama başarısız oldu, yerel varsayılanlar yükleniyor:", err);
        setMovies(defaultMovies);
        localStorage.setItem('film_match_list', JSON.stringify(defaultMovies));
      }
    };

    if (apiKey && !hasSeededTmdb) {
      seedFromTmdb();
    } else if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    } else {
      setMovies(defaultMovies);
      localStorage.setItem('film_match_list', JSON.stringify(defaultMovies));
    }
  }, []);

  // Helper to save movies to LocalStorage
  const saveMoviesToStorage = (updatedList) => {
    setMovies(updatedList);
    localStorage.setItem('film_match_list', JSON.stringify(updatedList));
  };

  // 2. Room Sync Hook: Manages all room and voter states
  const roomSync = useRoomSync(movies, setPage);

  // 3. CRUD: Create / Update
  const handleMovieSubmit = (movieData) => {
    if (editingMovie && editingMovie.id) {
      // UPDATE operation
      const updated = movies.map((m) =>
        m.id === editingMovie.id ? { ...m, ...movieData } : m
      );
      saveMoviesToStorage(updated);
      setEditingMovie(null);
    } else {
      // CREATE operation
      const newMovie = {
        id: Date.now().toString(),
        ...movieData,
      };
      saveMoviesToStorage([newMovie, ...movies]);
      setEditingMovie(null);
    }
  };

  // 4. CRUD: Delete
  const handleMovieDelete = (id) => {
    triggerConfirm(
      "Bu filmi kütüphaneden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      () => {
        const filtered = movies.filter((m) => m.id !== id);
        saveMoviesToStorage(filtered);
        if (editingMovie?.id === id) {
          setEditingMovie(null);
        }
      },
      "Filmi Sil 🗑️"
    );
  };

  // 5. CRUD: Reset Database to Defaults
  const handleResetToDefaults = () => {
    localStorage.removeItem('film_match_list_tmdb_seeded'); // Reset seed flag to allow fresh TMDB seed on reload
    saveMoviesToStorage(defaultMovies);
  };

  // Page Routing logic
  const renderPage = () => {
    switch (page) {
      case 'lobby':
        return (
          <Lobby
            roomId={roomSync.roomId}
            currentUser={roomSync.currentUser}
            members={roomSync.members}
            filters={roomSync.filters}
            createRoom={roomSync.createRoom}
            joinRoom={roomSync.joinRoom}
            startSoloMode={roomSync.startSoloMode}
            addBotFriend={roomSync.addBotFriend}
            updateFilters={roomSync.updateFilters}
            startGame={roomSync.startGame}
            initialMoviesPool={movies}
            leaveRoom={roomSync.leaveRoom}
            confirmAction={triggerConfirm}
            alertAction={triggerAlert}
          />
        );
      case 'swiper':
        return (
          <SwipeArena
            currentUser={roomSync.currentUser}
            members={roomSync.members}
            roomMovies={roomSync.roomMovies}
            votes={roomSync.votes}
            submitVote={roomSync.submitVote}
            setPage={setPage}
            leaveRoom={roomSync.leaveRoom}
            confirmAction={triggerConfirm}
          />
        );
      case 'results':
        return (
          <Results
            members={roomSync.members}
            roomMovies={roomSync.roomMovies}
            votes={roomSync.votes}
            setPage={setPage}
            leaveRoom={roomSync.leaveRoom}
            confirmAction={triggerConfirm}
          />
        );
      case 'database':
        return (
          <Database
            movies={movies}
            onSubmitMovie={handleMovieSubmit}
            onDeleteMovie={handleMovieDelete}
            editingMovie={editingMovie}
            setEditingMovie={setEditingMovie}
            resetToDefaults={handleResetToDefaults}
            confirmAction={triggerConfirm}
          />
        );
      default:
        return <div className="text-center py-20 text-gray-500">Sayfa Bulunamadı.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-150 flex flex-col font-sans">
      <Header
        activePage={page}
        setPage={setPage}
        roomId={roomSync.roomId}
        roomName={roomSync.roomName}
        leaveRoom={roomSync.leaveRoom}
        currentUser={roomSync.currentUser}
        gameStarted={roomSync.gameStarted}
        confirmAction={triggerConfirm}
      />
      <main className="flex-grow pb-12">
        {renderPage()}
      </main>
      <footer className="border-t border-gray-900 bg-gray-950/40 py-6 text-center text-xs flex flex-col items-center justify-center gap-3">
        <div className="font-bold uppercase tracking-wider text-gray-500">
          WatchMatch • Kaydır. Eşleş. İzle.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 text-[10px] text-gray-500 max-w-xl mx-auto px-4 leading-normal normal-case">
          <img 
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" 
            alt="TMDb Logo" 
            className="h-3.5 w-auto opacity-60 hover:opacity-100 transition"
          />
          <span>
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </span>
        </div>
      </footer>
      {modalConfig && (
        <CustomModal
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
        />
      )}
    </div>
  );
}