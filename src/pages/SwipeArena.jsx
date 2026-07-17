import React, { useState } from 'react';
import SwipeCard from '../components/SwipeCard';

export default function SwipeArena({
  currentUser,
  members,
  roomMovies,
  votes,
  submitVote,
  setPage,
  leaveRoom
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState(null); // { title: string, poster: string }

  const currentMovie = roomMovies[currentIndex];

  // Calculate voting progress for a user
  const getUserProgress = (memberName) => {
    const userVotes = votes[memberName] || {};
    return Object.keys(userVotes).length;
  };

  // Check if everyone has finished swiping
  const allFinished = members.length > 0 && members.every(member =>
    getUserProgress(member.name) >= roomMovies.length
  );

  const handleVoteSubmit = (movieId, vote) => {
    // 1. Submit the vote
    submitVote(movieId, vote);

    // 2. Check if this is a PERFECT MATCH (everyone has voted, and everyone voted 'like')
    // Or if others haven't voted yet, check if everyone who voted so far voted 'like'.
    // If it's a LIKE, and all other members who have already voted on this movie voted LIKE, and there's at least 2 members.
    if (vote === 'like' && members.length > 1) {
      let isPerfectSoFar = true;
      let voteCountForMovie = 1; // current user liked it

      members.forEach(m => {
        if (m.name === currentUser.name) return;
        const otherVotes = votes[m.name] || {};
        const otherVote = otherVotes[movieId];

        if (otherVote) {
          voteCountForMovie++;
          if (otherVote !== 'like') {
            isPerfectSoFar = false;
          }
        }
      });

      // If at least one other person has voted, and all votes are 'like', show a match alert!
      if (isPerfectSoFar && voteCountForMovie === members.length) {
        setMatchAlert({
          title: currentMovie.title,
          poster: currentMovie.poster
        });

        // Auto-close alert after 2.5 seconds
        setTimeout(() => {
          setMatchAlert(null);
          advanceMovie();
        }, 2500);
        return; // Don't advance movie yet, let the alert play
      }
    }

    advanceMovie();
  };

  const advanceMovie = () => {
    setCurrentIndex(prev => prev + 1);
  };

  // Check if user has finished swiping
  const isUserFinished = currentIndex >= roomMovies.length;

  return (
    <div className="max-w-6xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-4 gap-8 text-white px-4">
      {/* Perfect Match Fullscreen Alert overlay */}
      {matchAlert && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-md animate-fade-in">
          {/* Sparkles particle simulation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => {
              const delay = Math.random() * 2;
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              return (
                <span
                  key={i}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    fontSize: `${Math.random() * 20 + 15}px`
                  }}
                  className="absolute text-yellow-400 animate-ping opacity-60"
                >
                  {["✨", "🍿", "💖", "🎉"][i % 4]}
                </span>
              );
            })}
          </div>

          <div className="text-center space-y-4 max-w-sm p-6 bg-gray-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 scale-105 transition-all">
            <span className="text-6xl animate-bounce block">🎉 EŞLEŞME! 🎉</span>
            <img
              src={matchAlert.poster}
              alt={matchAlert.title}
              className="w-48 h-72 object-cover mx-auto rounded-2xl border-4 border-emerald-500/30 shadow-xl"
            />
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">{matchAlert.title}</h3>
            <p className="text-sm text-gray-400">
              Gruptaki herkes bu filmi beğendi! Akşam ne izleneceği belli oldu mu? 🍿
            </p>
          </div>
        </div>
      )}

      {/* Left Column: Swiper Progress & Member Tracker */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-extrabold text-base text-sky-300 border-b border-gray-800 pb-3 mb-4 flex items-center gap-2">
            📊 Oyuncu Durumu
          </h3>

          <div className="space-y-3">
            {members.map((member, idx) => {
              const progress = getUserProgress(member.name);
              const isFinished = progress >= roomMovies.length;
              return (
                <div key={idx} className="bg-gray-950/60 border border-gray-850 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{member.avatar}</span>
                      <span className="font-bold text-xs truncate max-w-[120px]">{member.name}</span>
                    </div>
                    {isFinished ? (
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Tamamladı
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/50 uppercase">
                        Oyluyor...
                      </span>
                    )}
                  </div>
                  {/* Miniature progress bar */}
                  <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-350 ${isFinished ? 'bg-emerald-400' : 'bg-sky-400'}`}
                      style={{ width: `${(progress / roomMovies.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-500 font-semibold text-right">
                    {progress} / {roomMovies.length} film
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3">
          <h3 className="font-extrabold text-base text-red-400 border-b border-gray-800 pb-3 mb-1 flex items-center gap-1.5">
            🚪 Oturum Yönetimi
          </h3>
          <button
            onClick={() => {
              confirmAction(
                "Mevcut oturumu sonlandırmak ve ana ekrana dönmek istediğinize emin misiniz? Bütün oylama verileriniz silinecektir.",
                leaveRoom,
                "Oturumdan Çık 🚪"
              );
            }}
            className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs font-black transition cursor-pointer text-center"
          >
            Oturumdan Çık 🚪
          </button>
        </div>
      </div>

      {/* Right Column: Swipe Area */}
      <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[500px]">
        {!isUserFinished && currentMovie ? (
          <div className="w-full flex flex-col items-center">
            {/* Round progress indicator */}
            <div className="mb-4 text-center">
              <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
                Film {currentIndex + 1} / {roomMovies.length}
              </span>
            </div>

            {/* Tinder swipe card */}
            <SwipeCard
              movie={currentMovie}
              onVote={handleVoteSubmit}
            />
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <span className="text-6xl block animate-bounce">🏁</span>
            <h3 className="text-2xl font-black text-sky-300">Harika, senin oylaman bitti!</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tüm filmleri başarıyla değerlendirdin. Arkadaşlarının swiplema işlemini bitirmesini bekliyoruz.
            </p>

            <div className="py-4 border-t border-b border-gray-850">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Genel Oylama İlerlemesi</div>
              <div className="grid grid-cols-2 gap-2 text-left">
                {members.map((m, idx) => (
                  <div key={idx} className="text-xs flex justify-between bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-850">
                    <span className="truncate">{m.avatar} {m.name}</span>
                    <span className="font-bold text-sky-400">
                      {getUserProgress(m.name) >= roomMovies.length ? '✓ Bitti' : `${getUserProgress(m.name)}/${roomMovies.length}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setPage('results')}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition text-sm cursor-pointer ${allFinished
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/10'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50'
                  }`}
              >
                {allFinished ? '➔ Sonuçları Gör!' : 'Yine de Sonuçları İncele'}
              </button>

              {!allFinished && (
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">
                  Herkes bitirdiğinde sonuçlar kilidi açılacaktır.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
