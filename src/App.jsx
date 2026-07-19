import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Lobby from './pages/Lobby';
import SwipeArena from './pages/SwipeArena';
import Results from './pages/Results';
import Database from './pages/Database';
import { defaultMovies } from './data/defaultMovies';
import useRoomSync from './hooks/useRoomSync';
import CustomModal from './components/CustomModal';
import Auth from './pages/Auth';
import { auth } from './lib/firebase';
import { ArrowUp } from 'lucide-react';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-[#5ca4a7]/90 text-[#050b0c] border border-[#5ca4a7]/20 hover:bg-[#5ca4a7] transition-all duration-300 shadow-[0_0_20px_rgba(92,164,167,0.4)] cursor-pointer hover:scale-110 active:scale-95 animate-fade-in flex items-center justify-center"
      aria-label="Yukarı Çık"
    >
      <ArrowUp className="w-5 h-5" strokeWidth={3} />
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState('lobby');
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
      setAuthLoading(false);
      
      if (user && !user.isAnonymous) {
        const savedName = localStorage.getItem('mm_saved_name');
        if (!savedName) {
          const defaultName = user.displayName || user.email.split('@')[0];
          localStorage.setItem('mm_saved_name', defaultName);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem('mm_current_user');
      sessionStorage.removeItem('mm_room_name');
      setPage('lobby');
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const triggerConfirm = (message, onConfirm, title = "Emin misiniz?") => {
    setModalConfig({
      title,
      message,
      confirmText: "Tamam",
      cancelText: "İptal",
      onConfirm: () => { onConfirm(); setModalConfig(null); },
      onCancel: () => { setModalConfig(null); }
    });
  };

  const triggerAlert = (message, title = "Bilgi") => {
    setModalConfig({
      title,
      message,
      confirmText: "Tamam",
      onConfirm: () => { setModalConfig(null); }
    });
  };

  const seedFromTmdb = async () => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      triggerAlert("TMDb API anahtarı bulunamadı.");
      return;
    }

    try {
      // Show loading alert or something (we don't have a loading state, but we can set modal)
      const pagePromises = [];
      const totalPages = 30; // approx 600 movies
      for (let p = 1; p <= totalPages; p++) {
        pagePromises.push(
          fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=tr-TR&page=${p}`).then(r => r.json())
        );
      }
      const pagesData = await Promise.all(pagePromises);
      const rawMovies = [];
      pagesData.forEach(pData => { if (pData.results) rawMovies.push(...pData.results); });

      if (rawMovies.length === 0) throw new Error("Empty TMDb results");

      const genreMap = {
        28: "Aksiyon", 12: "Aksiyon", 16: "Animasyon", 35: "Komedi",
        80: "Suç", 99: "Dram", 18: "Dram", 10751: "Animasyon",
        14: "Bilim Kurgu", 36: "Dram", 27: "Korku", 10402: "Dram",
        9648: "Gizem", 10749: "Romantik", 878: "Bilim Kurgu",
        10770: "Dram", 53: "Gerilim", 10752: "Dram", 37: "Aksiyon"
      };

      const getLangName = (lang) => {
        switch (lang) {
          case 'en': return 'İngilizce'; case 'tr': return 'Türkçe';
          case 'ja': return 'Japonca'; case 'ko': return 'Korece';
          case 'fr': return 'Fransızca'; case 'es': return 'İspanyolca';
          default: return 'İngilizce';
        }
      };

      const mapped = rawMovies.map((m) => {
        let mappedGenre = "Aksiyon";
        if (m.genre_ids && m.genre_ids.length > 0) mappedGenre = genreMap[m.genre_ids[0]] || "Aksiyon";
        const platforms = [];
        if (m.id % 2 === 0) platforms.push('Netflix');
        if (m.id % 3 === 0) platforms.push('Prime Video');
        if (m.id % 5 === 0) platforms.push('Disney+');
        if (m.id % 7 === 0) platforms.push('Apple TV');
        if (platforms.length === 0) platforms.push('Netflix');
        const duration = 90 + (m.id % 8) * 10;

        return {
          id: `tmdb_${m.id}`,
          title: m.title,
          year: m.release_date ? m.release_date.split('-')[0] : '2024',
          genre: mappedGenre,
          rating: parseFloat(m.vote_average?.toFixed(1)) || 7.0,
          note: m.overview || 'Konu özeti bulunamadı.',
          platforms,
          duration,
          language: getLangName(m.original_language),
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
          trailer: 'https://www.youtube.com'
        };
      });

      const seen = new Set();
      const unique = [];
      mapped.forEach(movie => { if (!seen.has(movie.id)) { seen.add(movie.id); unique.push(movie); } });

      setMovies(unique);
      localStorage.setItem('film_match_list', JSON.stringify(unique));
      localStorage.setItem('film_match_list_tmdb_seeded', 'true');

      triggerAlert(`${unique.length} film TMDb'den başarıyla çekildi!`, "TMDb Başarılı");
    } catch (err) {
      console.error("Seed failed:", err);
      triggerAlert("TMDb'den film çekerken bir hata oluştu.", "Hata");
    }
  };

  const autoSyncNewTmdbMovies = async (currentMoviesList) => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) return;

    try {
      // Check popular movies (first page) on TMDb for any new additions
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=tr-TR&page=1`);
      const data = await res.json();
      if (!data.results) return;

      const rawMovies = data.results;
      const currentIds = new Set(currentMoviesList.map(m => m.id));

      const genreMap = {
        28: "Aksiyon", 12: "Aksiyon", 16: "Animasyon", 35: "Komedi",
        80: "Suç", 99: "Dram", 18: "Dram", 10751: "Animasyon",
        14: "Bilim Kurgu", 36: "Dram", 27: "Korku", 10402: "Dram",
        9648: "Gizem", 10749: "Romantik", 878: "Bilim Kurgu",
        10770: "Dram", 53: "Gerilim", 10752: "Dram", 37: "Aksiyon"
      };

      const getLangName = (lang) => {
        switch (lang) {
          case 'en': return 'İngilizce'; case 'tr': return 'Türkçe';
          case 'ja': return 'Japonca'; case 'ko': return 'Korece';
          case 'fr': return 'Fransızca'; case 'es': return 'İspanyolca';
          default: return 'İngilizce';
        }
      };

      const newMoviesToPush = [];
      rawMovies.forEach((m) => {
        const customId = `tmdb_${m.id}`;
        if (!currentIds.has(customId)) {
          let mappedGenre = "Aksiyon";
          if (m.genre_ids && m.genre_ids.length > 0) mappedGenre = genreMap[m.genre_ids[0]] || "Aksiyon";
          const platforms = [];
          if (m.id % 2 === 0) platforms.push('Netflix');
          if (m.id % 3 === 0) platforms.push('Prime Video');
          if (m.id % 5 === 0) platforms.push('Disney+');
          if (m.id % 7 === 0) platforms.push('Apple TV');
          if (platforms.length === 0) platforms.push('Netflix');
          const duration = 90 + (m.id % 8) * 10;

          newMoviesToPush.push({
            id: customId,
            title: m.title,
            year: m.release_date ? m.release_date.split('-')[0] : '2024',
            genre: mappedGenre,
            rating: parseFloat(m.vote_average?.toFixed(1)) || 7.0,
            note: m.overview || 'Konu özeti bulunamadı.',
            platforms,
            duration,
            language: getLangName(m.original_language),
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
            trailer: 'https://www.youtube.com'
          });
        }
      });

      if (newMoviesToPush.length > 0) {
        const updatedList = [...newMoviesToPush, ...currentMoviesList];
        setMovies(updatedList);
        localStorage.setItem('film_match_list', JSON.stringify(updatedList));

        // Trigger a toast alert on page load to inform the host/user
        triggerAlert(
          `${newMoviesToPush.length} yeni film TMDb'den otomatik olarak çekilerek kütüphanenize eklendi! 🎬`,
          "TMDb Otomatik Eşitleme 🔄"
        );
      }
    } catch (err) {
      console.error("Auto sync failed:", err);
    }
  };

  useEffect(() => {
    const savedMovies = localStorage.getItem('film_match_list');
    const hasSeededTmdb = localStorage.getItem('film_match_list_tmdb_seeded') === 'true';
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    let initialList = [];
    let needsReseed = false;

    if (savedMovies) {
      try {
        initialList = JSON.parse(savedMovies);
        // Force re-seed if client database is old (< 500 films) or missing release year property
        if (hasSeededTmdb && Array.isArray(initialList)) {
          const tmdbMovies = initialList.filter(m => m.id.startsWith('tmdb_'));
          if (tmdbMovies.length > 0 && (!tmdbMovies[0].year || initialList.length < 500)) {
            needsReseed = true;
          }
        }
      } catch (e) {
        console.error("Migration check failed:", e);
      }
    }

    if (apiKey && (!hasSeededTmdb || needsReseed)) {
      seedFromTmdb();
    } else {
      if (savedMovies && initialList.length > 0) {
        setMovies(initialList);
      } else {
        initialList = defaultMovies;
        setMovies(defaultMovies);
        localStorage.setItem('film_match_list', JSON.stringify(defaultMovies));
      }

      // Check for updates dynamically on startup
      if (apiKey && initialList.length > 0) {
        autoSyncNewTmdbMovies(initialList);
      }
    }
  }, []);

  const saveMoviesToStorage = (updatedList) => {
    setMovies(updatedList);
    localStorage.setItem('film_match_list', JSON.stringify(updatedList));
  };

  const roomSync = useRoomSync(movies, setPage);

  const handleMovieSubmit = (movieData) => {
    if (editingMovie && editingMovie.id) {
      const updated = movies.map((m) => m.id === editingMovie.id ? { ...m, ...movieData } : m);
      saveMoviesToStorage(updated);
      setEditingMovie(null);
    } else {
      const newMovie = { id: Date.now().toString(), ...movieData };
      saveMoviesToStorage([newMovie, ...movies]);
      setEditingMovie(null);
    }
  };

  const handleMovieDelete = (id) => {
    triggerConfirm(
      "Bu filmi kütüphaneden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      () => {
        const filtered = movies.filter((m) => m.id !== id);
        saveMoviesToStorage(filtered);
        if (editingMovie?.id === id) setEditingMovie(null);
      },
      "Filmi Sil"
    );
  };

  const handleResetToDefaults = () => {
    localStorage.removeItem('film_match_list_tmdb_seeded');
    saveMoviesToStorage(defaultMovies);
  };

  const renderPage = () => {
    switch (page) {
      case 'lobby':
        return <Lobby roomId={roomSync.roomId} currentUser={roomSync.currentUser} members={roomSync.members} filters={roomSync.filters} createRoom={roomSync.createRoom} joinRoom={roomSync.joinRoom} startSoloMode={roomSync.startSoloMode} addBotFriend={roomSync.addBotFriend} updateFilters={roomSync.updateFilters} startGame={roomSync.startGame} movies={movies} leaveRoom={roomSync.leaveRoom} confirmAction={triggerConfirm} alertAction={triggerAlert} authUser={authUser} />;
      case 'swiper':
        return <SwipeArena currentUser={roomSync.currentUser} members={roomSync.members} roomMovies={roomSync.roomMovies} votes={roomSync.votes} submitVote={roomSync.submitVote} setPage={setPage} leaveRoom={roomSync.leaveRoom} confirmAction={triggerConfirm} />;
      case 'results':
        return <Results members={roomSync.members} roomMovies={roomSync.roomMovies} votes={roomSync.votes} setPage={setPage} leaveRoom={roomSync.leaveRoom} confirmAction={triggerConfirm} currentUser={roomSync.currentUser} resetGame={roomSync.resetGame} />;
      case 'database':
        return <Database movies={movies} onSubmitMovie={handleMovieSubmit} onDeleteMovie={handleMovieDelete} editingMovie={editingMovie} setEditingMovie={setEditingMovie} resetToDefaults={handleResetToDefaults} fetchFromTmdb={seedFromTmdb} confirmAction={triggerConfirm} />;
      default:
        return <div className="text-center py-20 text-[#4B5563]">Sayfa Bulunamadı.</div>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030708] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5ca4a7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen text-[#F5F7FA] flex flex-col font-['Inter',sans-serif] bg-gradient-to-b from-[#030708] via-[#071113] to-[#0a1619] relative overflow-hidden">
      {/* Background glow layers matching user image */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5ca4a7]/12 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#076465]/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#5ca4a7]/12 to-[#076465]/8 blur-[180px] rounded-full pointer-events-none z-0" />
      
      <Header
        activePage={page} setPage={setPage} roomId={roomSync.roomId}
        roomName={roomSync.roomName} leaveRoom={roomSync.leaveRoom}
        currentUser={roomSync.currentUser} gameStarted={roomSync.gameStarted}
        confirmAction={triggerConfirm}
        authUser={authUser}
        onSignOut={handleSignOut}
      />
      <main className={`flex-grow z-10 relative ${page === 'swiper' ? '' : 'pb-12'}`}>
        {renderPage()}
      </main>
      <footer className={`shrink-0 text-center text-xs py-4 select-none ${page === 'swiper' ? 'pb-3' : 'border-t border-[#1E2533]'}`}>
        {page !== 'swiper' && (
          <div className="font-medium text-[#4B5563] mb-2">
            WatchMatch
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-[10px] text-[#4B5563] px-4">
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="TMDb Logo"
            className="h-3 w-auto opacity-40 hover:opacity-70 transition"
          />
          <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
        </div>
      </footer>
      {modalConfig && (
        <CustomModal
          title={modalConfig.title} message={modalConfig.message}
          confirmText={modalConfig.confirmText} cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm} onCancel={modalConfig.onCancel}
        />
      )}
      <ScrollToTop />
    </div>
  );
}