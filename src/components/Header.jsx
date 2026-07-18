import React from 'react';
import { Film, Database, Lock, LogOut, Radio, User } from 'lucide-react';

export default function Header({ activePage, setPage, roomId, roomName, leaveRoom, currentUser, gameStarted, confirmAction, authUser, onSignOut }) {
  return (
    <header className="border-b border-[#1E2533] bg-[#090B10]/80 backdrop-blur-xl sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => !gameStarted && setPage('lobby')}>
          <img src="/logo.png" className="w-10 h-10 rounded-xl object-cover shadow-md border border-[#bd3191]/20" alt="Logo" />
          <div>
            <h1 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
              Watch<span className="text-[#bd3191]">Match</span>
            </h1>
            <p className="text-xs text-[#9CA3AF] font-medium -mt-0.5">
              Birlikte Keşfedin
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1.5 bg-[#11151E] p-1.5 rounded-2xl border border-[#1E2533]">
          <button
            onClick={() => setPage('lobby')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              activePage === 'lobby' || activePage === 'swiper' || activePage === 'results'
                ? 'bg-[#bd3191]/10 text-[#bd3191]'
                : 'text-[#9CA3AF] hover:text-[#F5F7FA]'
            }`}
          >
            <Film className="w-4 h-4" />
            <span className="hidden sm:inline">Lobi</span>
          </button>

          {gameStarted ? (
            <button
              disabled
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#4B5563] flex items-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Film Havuzu</span>
            </button>
          ) : (
            <button
              onClick={() => setPage('database')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
                activePage === 'database'
                  ? 'bg-[#bd3191]/10 text-[#bd3191]'
                  : 'text-[#9CA3AF] hover:text-[#F5F7FA]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Film Havuzu</span>
            </button>
          )}
        </div>

        {/* Right side: Room info or status */}
        {roomId ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#9CA3AF] font-medium">{roomName || 'Oda Kodu'}</div>
              <div className="text-base font-bold text-[#F5F7FA] tracking-wider font-mono select-all">{roomId}</div>
            </div>
            <div className="w-px h-8 bg-[#1E2533]" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#bd3191]/15 flex items-center justify-center text-sm font-bold text-[#bd3191]">
                {currentUser?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <button
                onClick={() => {
                  confirmAction(
                    "Mevcut odadan çıkmak istediğinize emin misiniz? Bütün oylama verileriniz silinecektir.",
                    leaveRoom,
                    "Odadan Çık"
                  );
                }}
                className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition cursor-pointer"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-medium">
              <Radio className="w-4 h-4 text-[#22C55E]" />
              <span>{authUser?.isAnonymous ? 'Anonim Giriş' : (authUser?.email ? authUser.email.split('@')[0] : 'Çevrimdışı')}</span>
            </div>
            {authUser && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#bd3191]/10 text-[#bd3191] hover:bg-[#bd3191]/20 transition cursor-pointer"
                title="Oturumu Kapat"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Oturumu Kapat</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
