import React from 'react';

export default function Header({ activePage, setPage, roomId, roomName, leaveRoom, currentUser, gameStarted, confirmAction }) {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => !gameStarted && setPage('lobby')}>
          <span className="text-3xl">🍿</span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              WatchMatch
            </h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
              Birlikte Keşfedin. Birlikte İzleyin.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-gray-900/60 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setPage('lobby')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activePage === 'lobby' || activePage === 'swiper' || activePage === 'results'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md'
                : 'text-gray-400 hover:text-white border border-transparent'
              }`}
          >
            🎮 Match Lobisi
          </button>

          {gameStarted ? (
            <button
              disabled
              title="Aktif bir oyun varken kütüphane düzenlenemez"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-transparent flex items-center gap-1 cursor-not-allowed opacity-50"
            >
              🔒 Film Havuzu
            </button>
          ) : (
            <button
              onClick={() => setPage('database')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activePage === 'database'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md'
                  : 'text-gray-400 hover:text-white border border-transparent'
                }`}
            >
              🎬 Film Havuzu (CRUD)
            </button>
          )}
        </div>

        {/* Room Info & Leave Button */}
        {roomId ? (
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 max-w-[240px] sm:max-w-none">
            <div className="text-right min-w-0">
              <div className="text-[10px] text-gray-500 font-semibold uppercase truncate max-w-[120px]">{roomName || 'Oda Kodu'}</div>
              <div className="text-sm font-bold text-sky-400 tracking-wider select-all">{roomId}</div>
            </div>
            <div className="h-6 w-[1px] bg-gray-800 shrink-0" />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-base" title={currentUser?.name}>
                {currentUser?.avatar || '👤'}
              </span>
              <button
                onClick={() => {
                  confirmAction(
                    "Mevcut odadan çıkmak istediğinize emin misiniz? Bütün oylama verileriniz silinecektir.",
                    leaveRoom,
                    "Odadan Çık 🚪"
                  );
                }}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Çevrimdışı Lobi
          </div>
        )}
      </div>
    </header>
  );
}
