import React, { useState } from 'react';
import { BOT_PRESETS } from '../hooks/useRoomSync';

const AVATARS = ["🍿", "🎬", "🚀", "🦄", "👽", "👻", "🎨", "🍕", "🎮", "🎸", "🦁", "🔮"];
const GENRES = ["Aksiyon", "Komedi", "Dram", "Bilim Kurgu", "Korku", "Gerilim", "Animasyon", "Gizem", "Suç", "Romantik"];
const PLATFORMS = ["Netflix", "Disney+", "Prime Video", "Apple TV"];
const LANGUAGES = ["İngilizce", "Türkçe", "Japonca", "Korece", "Fransızca", "İspanyolca"];

const MOODS = [
  { name: "⚡ Aksiyon & Bilim Kurgu", genres: ["Aksiyon", "Bilim Kurgu"] },
  { name: "😂 Neşeli & Eğlenceli", genres: ["Komedi", "Animasyon"] },
  { name: "😢 Duygusal & Hüzünlü", genres: ["Dram"] },
  { name: "😱 Korku & Gerilim", genres: ["Korku", "Gerilim"] },
  { name: "🧠 Suç & Gizem", genres: ["Suç", "Gizem"] }
];

const TMDB_GENRE_MAP = {
  28: "Aksiyon",
  12: "Aksiyon",
  16: "Animasyon",
  35: "Komedi",
  80: "Suç",
  99: "Dram",
  18: "Dram",
  10751: "Animasyon",
  14: "Bilim Kurgu",
  36: "Dram",
  27: "Korku",
  10402: "Dram",
  9648: "Gizem",
  10749: "Romantik",
  878: "Bilim Kurgu",
  10770: "Dram",
  53: "Gerilim",
  10752: "Dram",
  37: "Aksiyon"
};

const getLanguageName = (lang) => {
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

export default function Lobby({
  roomId: _roomId,
  currentUser,
  members,
  filters,
  createRoom,
  joinRoom,
  startSoloMode,
  addBotFriend,
  updateFilters,
  startGame,
  initialMoviesPool,
  leaveRoom,
  confirmAction,
  alertAction
}) {
  const [name, setName] = useState(() => localStorage.getItem('mm_saved_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('mm_saved_avatar') || AVATARS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');
  const [isJoinMode, setIsJoinMode] = useState(false);
  const [roomHistory] = useState(() => JSON.parse(localStorage.getItem('mm_room_history') || '[]'));
  const [movieSource, setMovieSource] = useState('local');
  const [fetchingTmdb, setFetchingTmdb] = useState(false);

  // Filter count helper to show how many movies will match this configuration
  const getMatchingMoviesCount = () => {
    let count = 0;
    initialMoviesPool.forEach(movie => {
      // Genre filter
      if (filters.genres.length > 0 && !filters.genres.includes(movie.genre)) return;
      // Platform filter
      if (filters.platforms.length > 0 && !movie.platforms.some(p => filters.platforms.includes(p))) return;
      // Rating filter
      if (filters.minRating > 0 && parseFloat(movie.rating) < filters.minRating) return;
      // Duration filter
      if (filters.maxDuration < 240 && movie.duration > filters.maxDuration) return;
      // Language filter
      if (filters.language && movie.language !== filters.language) return;

      count++;
    });
    return count;
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return alertAction("Lütfen adınızı girin!", "İsim Gerekli 👤");
    createRoom(name.trim(), selectedAvatar, customRoomName);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim()) return alertAction("Lütfen adınızı girin!", "İsim Gerekli 👤");
    if (!joinCode.trim()) return alertAction("Lütfen oda kodunu girin!", "Kod Gerekli 🔑");
    joinRoom(joinCode.trim(), name.trim(), selectedAvatar);
  };

  const handleGenreToggle = (genre) => {
    if (!currentUser?.isHost) return;
    const isSelected = filters.genres.includes(genre);
    const updatedGenres = isSelected
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilters({ ...filters, genres: updatedGenres });
  };

  const handlePlatformToggle = (platform) => {
    if (!currentUser?.isHost) return;
    const isSelected = filters.platforms.includes(platform);
    const updatedPlatforms = isSelected
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    updateFilters({ ...filters, platforms: updatedPlatforms });
  };

  const handleMoodSelect = (mood) => {
    updateFilters({ ...filters, genres: mood.genres });
  };

  const handleStartGameClick = async () => {
    if (!currentUser?.isHost) return;

    if (movieSource === 'local') {
      startGame();
      return;
    }

    setFetchingTmdb(true);
    try {
      const apiKey = import.meta.env.VITE_TMDB_API_KEY;
      if (!apiKey) {
        alertAction("Lütfen .env dosyasında VITE_TMDB_API_KEY değerini ayarlayın!", "Eksik Yapılandırma ⚠️");
        setFetchingTmdb(false);
        return;
      }

      let endpoint = 'popular';
      if (movieSource === 'tmdb_top_rated') endpoint = 'top_rated';
      else if (movieSource === 'tmdb_now_playing') endpoint = 'now_playing';

      const pagePromises = [];
      const totalPages = 18; // 18 pages * 20 movies = 360 movies total!
      for (let p = 1; p <= totalPages; p++) {
        pagePromises.push(
          fetch(`https://api.themoviedb.org/3/movie/${endpoint}?api_key=${apiKey}&language=tr-TR&page=${p}`).then(r => r.json())
        );
      }
      
      const pagesData = await Promise.all(pagePromises);
      const rawMovies = [];
      pagesData.forEach(pData => {
        if (pData.results) {
          rawMovies.push(...pData.results);
        }
      });

      if (rawMovies.length === 0) {
        alertAction("TMDb API'den film verileri alınamadı.", "API Hatası 🌐");
        setFetchingTmdb(false);
        return;
      }

      // Map raw movies directly using deterministic fields (no details sub-fetches to keep load instant)
      const mappedMovies = rawMovies.map((m) => {
        let mappedGenre = "Aksiyon";
        if (m.genre_ids && m.genre_ids.length > 0) {
          const matchingId = Object.keys(TMDB_GENRE_MAP).find(k => k === m.genre_ids[0].toString());
          mappedGenre = matchingId ? TMDB_GENRE_MAP[matchingId] : "Aksiyon";
        }

        // Deterministic watch platforms based on movie ID (guarantees perfect multiplayer state sync)
        const platforms = [];
        if (m.id % 2 === 0) platforms.push('Netflix');
        if (m.id % 3 === 0) platforms.push('Prime Video');
        if (m.id % 5 === 0) platforms.push('Disney+');
        if (m.id % 7 === 0) platforms.push('Apple TV');
        if (platforms.length === 0) {
          platforms.push('Netflix');
        }

        // Deterministic duration based on movie ID (guarantees perfect multiplayer state sync)
        const duration = 90 + (m.id % 8) * 10; // returns 90, 100, 110, 120, 130, 140, 150, 160 minutes

        return {
          id: `tmdb_${m.id}`,
          title: m.title,
          genre: mappedGenre,
          rating: parseFloat(m.vote_average?.toFixed(1)) || 7.0,
          note: m.overview || 'Konu özeti mevcut değil.',
          platforms: platforms,
          duration: duration,
          language: getLanguageName(m.original_language),
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
          trailer: 'https://www.youtube.com'
        };
      });

      // Filter out duplicates (if any)
      const seen = new Set();
      const uniqueMovies = [];
      mappedMovies.forEach(movie => {
        if (!seen.has(movie.id)) {
          seen.add(movie.id);
          uniqueMovies.push(movie);
        }
      });

      // Filter according to lobby configurations
      let filtered = [...uniqueMovies];
      
      // Genre filter
      if (filters.genres.length > 0) {
        filtered = filtered.filter(m => filters.genres.includes(m.genre));
      }
      
      // Platform filter
      if (filters.platforms.length > 0) {
        filtered = filtered.filter(m =>
          m.platforms.some(p => filters.platforms.includes(p))
        );
      }
      
      // Rating filter
      if (filters.minRating > 0) {
        filtered = filtered.filter(m => m.rating >= filters.minRating);
      }
      
      // Duration filter
      if (filters.maxDuration < 240) {
        filtered = filtered.filter(m => m.duration <= filters.maxDuration);
      }
      
      // Language filter
      if (filters.language) {
        filtered = filtered.filter(m => filters.language === filters.language);
      }

      if (filtered.length === 0) {
        alertAction("Seçtiğiniz filtre koşullarına uygun canlı TMDb filmi bulunamadı. Lütfen filtrelerinizi genişleterek tekrar deneyin.", "Sonuç Yok 🔍");
        setFetchingTmdb(false);
        return;
      }

      startGame(filtered); // start matching session with all matching films in the pool
    } catch (err) {
      console.error(err);
      alertAction("TMDb canlı verileri çekilirken bir sorun oluştu.", "Bağlantı Hatası ❌");
    } finally {
      setFetchingTmdb(false);
    }
  };

  const matchedCount = getMatchingMoviesCount();

  // SCREEN 1: Authentication / Room Setup (Not logged in)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl text-white">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">👋</span>
          <h2 className="text-2xl font-black bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">
            WatchMatch'e Hoş Geldin!
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Arkadaşlarınla ortak filmlerini bulmak veya tek başına öneri almak için profili doldur.
          </p>
        </div>

        <form onSubmit={isJoinMode ? handleJoin : handleCreate} className="space-y-6">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider text-center">
              Karakterini Seç: {selectedAvatar}
            </label>
            <div className="grid grid-cols-6 gap-2 bg-gray-950 p-3 rounded-2xl border border-gray-800">
              {AVATARS.map(avatar => (
                <button
                  type="button"
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-xl transition-all duration-200 cursor-pointer text-center ${selectedAvatar === avatar
                    ? 'bg-sky-500/25 border border-sky-500 scale-110'
                    : 'bg-transparent border border-transparent hover:bg-gray-800/40'
                    }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">İsminiz</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                localStorage.setItem('mm_saved_name', e.target.value);
              }}
              placeholder="Örn: Burak"
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-850 text-sm focus:outline-none focus:border-sky-500 text-white transition font-medium"
            />
          </div>

          {/* Multiplayer Room Name (If hosting and not joining) */}
          {!isJoinMode && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Oda İsmi (Opsiyonel)</label>
              <input
                type="text"
                value={customRoomName}
                onChange={(e) => setCustomRoomName(e.target.value)}
                placeholder="Örn: Cuma Gecesi Ekibi"
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-850 text-sm focus:outline-none focus:border-sky-500 text-white transition font-medium"
              />
            </div>
          )}

          {/* Room Join Code (If join mode is active) */}
          {isJoinMode && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Katılım Kodu (Room Code)</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Örn: 123456"
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-850 text-sm focus:outline-none focus:border-sky-500 text-white transition font-mono tracking-widest text-center"
              />
            </div>
          )}

          {/* Dynamic submit and trigger button */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white font-extrabold rounded-xl text-sm transition shadow-lg shadow-purple-500/10 cursor-pointer tracking-wider uppercase"
            >
              {isJoinMode ? 'Odaya Katıl 🚀' : 'Yeni Oda Oluştur 🔑'}
            </button>

            {/* Toggle Modes */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsJoinMode(!isJoinMode)}
                className="flex-1 py-2 text-xs font-bold bg-gray-950 hover:bg-gray-800 text-sky-400 rounded-xl border border-gray-850 transition cursor-pointer"
              >
                {isJoinMode ? 'Oda Kurucu Modu' : 'Odaya Katılma Modu'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) return alertAction("Lütfen önce adınızı girin!", "Giriş Gerekli 👤");
                  startSoloMode(name.trim(), selectedAvatar);
                }}
                className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition cursor-pointer"
              >
                👤 Tek Başıma Oyna
              </button>
            </div>
          </div>
        </form>

        {/* Room History shortcuts */}
        {roomHistory.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800">
            <span className="text-[10px] text-gray-500 font-extrabold block uppercase tracking-wider mb-2.5 text-center">Son Katıldığın Odalar</span>
            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
              {roomHistory.map((item, idx) => {
                const code = typeof item === 'object' ? item.code : item;
                const rName = typeof item === 'object' ? item.name : `Oda #${item}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!name.trim()) return alertAction("Lütfen önce adınızı girin!", "Giriş Gerekli 👤");
                      joinRoom(code, name.trim(), selectedAvatar);
                    }}
                    className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-850 hover:bg-gray-800/40 text-left transition flex items-center justify-between text-xs font-semibold cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="text-gray-300 block truncate">{rName}</span>
                      <span className="text-[9px] text-gray-500 font-mono">Kod: {code}</span>
                    </div>
                    <span className="text-[10px] text-sky-400 font-bold shrink-0">Hızlı Gir →</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // SCREEN 2: Active Room view (Waiting for launch / Choosing Filters)
  return (
    <div className="max-w-6xl mx-auto my-6 text-white px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Column: Room Info & Joined Members */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
            <h3 className="font-extrabold text-lg text-sky-300">
              {currentUser.isSolo ? '👤 Solo Oturum' : '👥 Oda Üyeleri'}
            </h3>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {members.length} Kişi
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-950/50 p-2.5 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{member.avatar}</span>
                  <div>
                    <span className="font-bold text-sm block truncate max-w-[120px]">{member.name}</span>
                    <span className="text-[9px] text-gray-500 font-semibold block uppercase">
                      {member.isSolo ? 'Solo İzleyici' : (member.isBot ? 'Bot Arkadaş' : (member.isHost ? 'Yönetici' : 'Oyuncu'))}
                    </span>
                  </div>
                </div>
                {member.isHost ? (
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md font-extrabold">👑 Lider</span>
                ) : (
                  <span className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700/50 px-2 py-0.5 rounded-md font-semibold">Aktif</span>
                )}
              </div>
            ))}
          </div>

          {/* Share instructions for guest */}
          {!currentUser.isHost && (
            <div className="mt-4 p-3 bg-gray-950/40 rounded-xl border border-gray-850 text-center text-xs text-gray-400">
              Yöneticinin filtreleri seçip oyunu başlatması bekleniyor... 🍿
            </div>
          )}
        </div>

        {/* Invite Virtual Friends (Bots) - Host Only, NOT in Solo */}
        {currentUser.isHost && !currentUser.isSolo && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="font-extrabold text-base text-purple-400 border-b border-gray-800 pb-3 mb-4 flex items-center gap-1.5">
              🤖 Yapay Zeka Arkadaşlar
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Tek başınaysan veya odayı doldurmak istiyorsan, farklı zevklere sahip sanal bot arkadaşları davet et!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BOT_PRESETS.map((bot, idx) => {
                const isAdded = members.some(m => m.name === bot.name);
                return (
                  <button
                    key={idx}
                    onClick={() => addBotFriend(bot)}
                    disabled={isAdded}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between h-20 transition text-xs font-semibold cursor-pointer ${isAdded
                      ? 'bg-gray-950/50 border-gray-850 text-gray-500 opacity-60'
                      : 'bg-gray-950 border-purple-500/15 hover:border-purple-500/30 text-gray-200 hover:bg-gray-950/80 shadow-md'
                      }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="truncate max-w-[80px]">{bot.name.split(" ")[0]}</span>
                      <span>{bot.avatar}</span>
                    </div>
                    <span className={`text-[8px] px-1 py-0.5 rounded ${isAdded
                      ? 'bg-gray-800 text-gray-500'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                      {isAdded ? 'Lobide' : 'Davet Et'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mood Picker - Solo Mode Only */}
        {currentUser.isSolo && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3">
            <h3 className="font-extrabold text-base text-purple-400 border-b border-gray-800 pb-3 mb-2 flex items-center gap-1.5">
              🎭 Bugün Nasıl Hissediyorsun?
            </h3>
            <p className="text-[11px] text-gray-400">
              Ruh halinize uygun film türlerini tek tıkla otomatik ayarlayabilirsiniz:
            </p>
            <div className="flex flex-col gap-2">
              {MOODS.map((mood, idx) => {
                const isSelected = filters.genres.length === mood.genres.length &&
                  mood.genres.every(g => filters.genres.includes(g));
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleMoodSelect(mood)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${isSelected
                      ? 'bg-purple-500/10 border-purple-500/35 text-purple-400 shadow-md'
                      : 'bg-gray-950 border-gray-850 text-gray-300 hover:text-white'
                      }`}
                  >
                    <span>{mood.name}</span>
                    {isSelected && <span className="text-[10px] text-purple-400">✨ Seçili</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Solo Session Exit Button */}
        {currentUser.isSolo && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3">
            <h3 className="font-extrabold text-base text-red-400 border-b border-gray-800 pb-3 mb-2 flex items-center gap-1.5">
              🚪 Oturumu Sonlandır
            </h3>
            <p className="text-[11px] text-gray-400">
              Grup moduna geçmek veya oda oluşturmak için bu oturumu kapatabilirsiniz:
            </p>
            <button
              type="button"
              onClick={() => {
                confirmAction(
                  "Mevcut solo oturumdan çıkıp ana ekrana dönmek istediğinize emin misiniz?",
                  leaveRoom,
                  "Solo Oturumdan Çık 🚪"
                );
              }}
              className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-black transition cursor-pointer text-center"
            >
              Solo Oturumdan Çık 🚪
            </button>
          </div>
        )}
      </div>

      {/* Middle/Right Columns: Settings & Filters Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="border-b border-gray-800 pb-3 mb-6 flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-sky-300">⚙️ Eşleşme Filtreleri</h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {currentUser.isHost ? 'Yönetim Sende' : 'Sadece İzle'}
            </span>
          </div>

          <div className="space-y-6">
            {/* Movie Pool Source Selector */}
            {currentUser.isHost && (
              <div className="bg-gray-950/40 p-4 rounded-xl border border-gray-850 space-y-3">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">🍿 Film Veri Kaynağı</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovieSource('local')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      movieSource === 'local'
                        ? 'bg-sky-500/10 border-sky-500/35 text-sky-400 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    🎬 Yerel Kütüphane ({initialMoviesPool.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovieSource('tmdb_popular')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      movieSource === 'tmdb_popular'
                        ? 'bg-purple-500/10 border-purple-500/35 text-purple-400 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    🔥 Popüler (TMDb)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovieSource('tmdb_top_rated')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      movieSource === 'tmdb_top_rated'
                        ? 'bg-amber-500/10 border-amber-500/35 text-amber-400 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    🌟 En İyiler (TMDb)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovieSource('tmdb_now_playing')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                      movieSource === 'tmdb_now_playing'
                        ? 'bg-pink-500/10 border-pink-500/35 text-pink-400 shadow-md'
                        : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                    }`}
                  >
                    🎭 Vizyondakiler (TMDb)
                  </button>
                </div>
              </div>
            )}

            {/* Genre Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Tür Seçimi (Tümü için boş bırak)</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => {
                  const isSelected = filters.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      disabled={!currentUser.isHost}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${isSelected
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/35 shadow-md shadow-sky-500/5'
                        : 'bg-gray-950 text-gray-400 border-gray-850 hover:text-white'
                        }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">İzleme Platformları</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(platform => {
                  const isSelected = filters.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      disabled={!currentUser.isHost}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/35 shadow-md shadow-purple-500/5'
                          : 'bg-gray-950 text-gray-400 border-gray-850 hover:text-white'
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
              {movieSource !== 'local' && (
                <span className="text-[10px] text-gray-500 mt-1 block">TMDb canlı listelerinde platform filtreleri Türkiye abonelik sağlayıcılarına göre otomatik eşleştirilir.</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IMDb Rating Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Minimum IMDb Puanı: {filters.minRating > 0 ? `${filters.minRating} ⭐` : 'Tümü'}</label>
                <input
                  type="range"
                  min="0"
                  max="9.0"
                  step="0.5"
                  value={filters.minRating || 0}
                  disabled={!currentUser.isHost}
                  onChange={(e) => updateFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Puan Seçilmedi</span>
                  <span>7.0 ⭐</span>
                  <span>8.0 ⭐</span>
                  <span>9.0 ⭐</span>
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Maksimum Süre: {filters.maxDuration < 240 ? `${filters.maxDuration} Dk` : 'Sınırsız'}</label>
                <input
                  type="range"
                  min="80"
                  max="240"
                  step="10"
                  value={filters.maxDuration || 240}
                  disabled={!currentUser.isHost}
                  onChange={(e) => updateFilters({ ...filters, maxDuration: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>80 Dk</span>
                  <span>120 Dk (Kısa)</span>
                  <span>180 Dk</span>
                  <span>Sınırsız</span>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Dil ve Ülke Filtresi</label>
              <select
                value={filters.language || ''}
                disabled={!currentUser.isHost}
                onChange={(e) => updateFilters({ ...filters, language: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-sm focus:outline-none focus:border-sky-500 transition text-gray-300"
              >
                <option value="">Fark Etmez (Tüm Diller)</option>
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Stats & Launch Section */}
          <div className="mt-8 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-950/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="text-center md:text-left">
              <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Aktif Eşleşecek Film Sayısı</span>
              <span className="text-2xl font-black text-emerald-400">
                {movieSource === 'local' ? `${matchedCount} film` : 'Canlı TMDb Havuzu'}
              </span>
              <span className="text-xs text-gray-400"> 
                {movieSource === 'local' ? ' (filtrelerinize uygun)' : ' (seçtiğiniz filtrelerle canlı çekilir)'}
              </span>
            </div>

            {currentUser.isHost ? (
              <button
                onClick={handleStartGameClick}
                disabled={fetchingTmdb || (movieSource === 'local' && matchedCount === 0)}
                className={`w-full md:w-auto font-black px-8 py-3 rounded-xl shadow-lg transition tracking-wide text-sm cursor-pointer ${(movieSource === 'local' && matchedCount === 0)
                    ? 'bg-gray-800 text-gray-500 border border-gray-800 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-purple-500/10'
                  }`}
              >
                {fetchingTmdb ? 'Yükleniyor...' : (currentUser.isSolo ? '🎬 Önerileri Getir!' : '🎮 Eşleşmeyi Başlat!')}
              </button>
            ) : (
              <div className="text-sm font-semibold text-purple-400 animate-pulse bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                🍿 Liderin oyunu başlatması bekleniyor...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
