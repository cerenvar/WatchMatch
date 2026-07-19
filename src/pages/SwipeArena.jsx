import React, { useState, useEffect, useRef } from 'react';
import { Heart, X as XIcon, Minus } from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import { HandHeart, Info } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function SwipeArena({ roomMovies: movies, submitVote: onVote, votes, currentUser, setPage }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [activities, setActivities] = useState([]);
  const prevVotesRef = useRef(votes);

  useEffect(() => {
    const prevVotes = prevVotesRef.current;
    let newActivities = [];

    Object.keys(votes).forEach(userName => {
      const userVotes = votes[userName] || {};
      const prevUserVotes = prevVotes[userName] || {};

      Object.keys(userVotes).forEach(movieId => {
        if (!prevUserVotes[movieId]) {
          // New vote found!
          // We don't show the user's own votes in the activity feed, unless we want to. Let's skip own votes.
          if (userName !== currentUser?.name) {
            newActivities.push({
              id: Date.now() + Math.random(),
              name: userName,
              vote: userVotes[movieId]
            });
          }
        }
      });
    });

    if (newActivities.length > 0) {
      setActivities(prev => [...prev, ...newActivities].slice(-5)); // Keep only last 5

      // Auto remove after 4 seconds
      newActivities.forEach(activity => {
        setTimeout(() => {
          setActivities(prev => prev.filter(a => a.id !== activity.id));
        }, 4000);
      });
    }

    prevVotesRef.current = votes;
  }, [votes, currentUser]);

  const renderVoteIcon = (vote) => {
    if (vote === 'like') return <Heart className="w-4 h-4 text-[#22C55E] fill-current" />;
    if (vote === 'dislike') return <XIcon className="w-4 h-4 text-[#EF4444]" />;
    return <Minus className="w-4 h-4 text-[#3B82F6]" />;
  };

  const handleVote = (movieId, vote) => {
    onVote(movieId, vote);
    setCurrentIndex(prev => prev + 1);
  };

  const safeMovies = movies || [];

  if (safeMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center px-4">
        <h2 className="text-2xl font-black text-[#F5F7FA] mb-4">Filmler Yükleniyor veya Bulunamadı</h2>
        <button
          onClick={() => setPage && setPage('lobby')}
          className="bg-[#1E2533] hover:bg-[#2A3441] text-white font-bold py-3 px-8 rounded-xl transition"
        >
          Lobiye Dön
        </button>
      </div>
    );
  }

  const currentMovie = safeMovies[currentIndex];

  if (currentIndex >= safeMovies.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center px-4">
        <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
          <HandHeart className="w-10 h-10 text-[#22C55E]" />
        </div>
        <h2 className="text-3xl font-black text-[#F5F7FA] mb-4">Harika İş Çıkardın!</h2>
        <p className="text-lg text-[#9CA3AF] font-medium max-w-2xl mb-8">
          Şimdilik havuzdaki tüm filmleri değerlendirdin. Diğerlerinin de bitirmesini bekleyebilir veya sonuçlara göz atabilirsin.
        </p>
        <button
          onClick={() => setPage && setPage('results')}
          className="glass-btn-primary py-3 px-8 rounded-xl transition cursor-pointer font-black text-sm uppercase tracking-wider"
        >
          Sonuçları Gör
        </button>
      </div>
    );
  }

  const progressPercentage = ((currentIndex) / safeMovies.length) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] px-4">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between mb-4 gap-6 shrink-0 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#5ca4a7]/10 flex items-center justify-center border border-[#5ca4a7]/20 shadow-lg">
            <Avatar emoji={currentUser?.avatar} className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F5F7FA]">{currentUser?.name}</div>
            <div className="text-xs font-semibold text-[#9CA3AF]">Oy Veriyor</div>
          </div>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="flex justify-between text-xs font-bold text-[#9CA3AF] mb-2 uppercase tracking-wider">
            <span>İlerleme</span>
            <span>{currentIndex} / {safeMovies.length}</span>
          </div>
          <div className="h-2.5 bg-white/[0.01] border border-white/[0.06] rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#5ca4a7] to-[#f4ac5c] transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(92,164,167,0.5)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Swipe Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full perspective-1000">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-auto h-[45vh] max-h-[420px] aspect-[2/3] bg-[#11151E]/60 backdrop-blur-md rounded-3xl border border-[#1E2533]/40 scale-[0.95] translate-y-4 opacity-50 shadow-2xl" />
          <div className="absolute w-auto h-[45vh] max-h-[420px] aspect-[2/3] bg-[#11151E]/60 rounded-3xl border border-[#1E2533]/40 scale-[0.90] translate-y-8 opacity-25" />
        </div>

        {currentMovie && (
          <div className="w-full max-w-sm z-10">
            <SwipeCard key={currentMovie.id} movie={currentMovie} onVote={handleVote} />
          </div>
        )}
      </div>

      <div className="text-center mt-6 mb-4 text-xs font-semibold text-[#4B5563] shrink-0 flex items-center justify-center gap-2">
        <Info className="w-4 h-4" /> Kartları sürükleyerek veya butonları kullanarak oy verebilirsiniz.
      </div>

      {/* Activity Feed / Emoji Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {activities.map((act) => (
          <div key={act.id} className="animate-slide-up-fade bg-[#181D28]/90 backdrop-blur-md border border-[#1E2533] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold text-white pointer-events-auto">
            <div className="w-8 h-8 rounded-full bg-[#11151E] flex items-center justify-center">
              {renderVoteIcon(act.vote)}
            </div>
            <span>
              <span className="text-[#9CA3AF] mr-1">{act.name}</span>
              {act.vote === 'like' ? 'beğendi!' : act.vote === 'dislike' ? 'pas geçti.' : 'belki izler.'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
