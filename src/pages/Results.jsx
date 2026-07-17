import React, { useState } from 'react';
import MatchWheel from '../components/MatchWheel';

export default function Results({
  members,
  roomMovies,
  votes,
  setPage,
  leaveRoom
}) {
  const [showWheel, setShowWheel] = useState(false);

  // Analyze movie voting results
  const getResultsData = () => {
    const scoredMovies = roomMovies.map(movie => {
      let likes = 0;
      let dislikes = 0;
      let neutrals = 0;
      const voterDetails = [];

      members.forEach(member => {
        const userVote = votes[member.name]?.[movie.id];
        if (userVote === 'like') likes++;
        else if (userVote === 'dislike') dislikes++;
        else if (userVote === 'neutral') neutrals++;

        voterDetails.push({
          name: member.name,
          avatar: member.avatar,
          vote: userVote || 'none' // 'like', 'dislike', 'neutral', 'none'
        });
      });

      // Simple rating calculation for ordering
      // Likes give +3, neutrals +1, dislikes -2, no vote 0
      const score = (likes * 3) + (neutrals * 1) - (dislikes * 2);

      return {
        ...movie,
        likes,
        dislikes,
        neutrals,
        score,
        voterDetails
      };
    });

    // Sort by:
    // 1. Likes count (descending)
    // 2. Score (descending)
    const sorted = scoredMovies.sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes;
      return b.score - a.score;
    });

    const perfectMatches = sorted.filter(m => m.likes === members.length && members.length > 0);
    const partialMatches = sorted.filter(m => m.likes > 0 && m.likes < members.length);
    const otherMovies = sorted.filter(m => m.likes === 0);

    return {
      perfectMatches,
      partialMatches,
      otherMovies,
      allScored: sorted
    };
  };

  const { perfectMatches, partialMatches, otherMovies, allScored } = getResultsData();

  // Pick candidate movies for the spinning wheel (all movies with at least one LIKE, or all if none liked)
  const wheelCandidates = allScored.filter(m => m.likes > 0);
  const finalWheelPool = wheelCandidates.length > 0 ? wheelCandidates : roomMovies;

  const renderVoteBadge = (vote) => {
    switch (vote) {
      case 'like':
        return <span className="text-emerald-400 text-[10px] font-bold" title="Beğendi">❤️</span>;
      case 'dislike':
        return <span className="text-rose-500 text-[10px] font-bold" title="İstemiyor">❌</span>;
      case 'neutral':
        return <span className="text-amber-500 text-[10px] font-bold" title="Kararsız">😐</span>;
      default:
        return <span className="text-gray-650 text-[10px]" title="Oy Vermedi">➖</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 text-white px-4">
      {/* Header Summary */}
      <div className="text-center mb-8">
        <span className="text-5xl block mb-2">🎉</span>
        <h2 className="text-3xl font-black bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Oylama Sonuçları
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Gruptaki herkesin oyları toplandı. Ortak zevklerinizi keşfedin! 🎬
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-8 shadow-md">
        <div className="text-left">
          <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Aktivite Durumu</span>
          <span className="text-sm font-semibold text-gray-300">
            {perfectMatches.length} Tam Eşleşme, {partialMatches.length} Kısmi Eşleşme
          </span>
        </div>

        <div className="flex gap-2">
          {finalWheelPool.length > 0 && (
            <button
              onClick={() => setShowWheel(true)}
              className="bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-sky-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              🎲 Rastgele Birini Seç
            </button>
          )}

          <button
            onClick={() => setPage('lobby')}
            className="bg-gray-850 hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Lobiye Dön
          </button>

          <button
            onClick={() => {
              confirmAction(
                "Mevcut oturumu sonlandırmak ve ana ekrana dönmek istediğinize emin misiniz? Bütün oylama verileriniz silinecektir.",
                leaveRoom,
                "Oturumdan Çık 🚪"
              );
            }}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            Oturumdan Çık 🚪
          </button>
        </div>
      </div>

      {/* RESULTS LIST SECTIONS */}
      {perfectMatches.length === 0 && partialMatches.length === 0 ? (
        // NO MATCHES SCENARIO
        <div className="bg-gray-900 border border-dashed border-gray-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <span className="text-5xl block animate-bounce">😅</span>
          <h3 className="text-xl font-bold text-sky-300">Ortak Nokta Bulunamadı</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Maalesef bu grupta herkesin beğendiği ortak bir film eşleşmedi.
          </p>
          <div className="bg-gray-950 p-4 rounded-xl text-left border border-gray-850 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold block uppercase">Çözüm Önerileri:</span>
            <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
              <li>Lobiye dönüp filtreleri genişletmeyi deneyin.</li>
              <li>Film Havuzu sayfasından listeye yeni filmler ekleyin.</li>
              <li>Kararsızım (😐) oylarını da değerlendirmeye alın!</li>
            </ul>
          </div>
          <button
            onClick={() => setPage('lobby')}
            className="w-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold py-2.5 rounded-xl border border-sky-500/20 transition text-xs cursor-pointer"
          >
            Lobiye Dön ve Yeniden Dene
          </button>
        </div>
      ) : (
        // MATCHES DISPLAY
        <div className="space-y-8">

          {/* 1. Perfect Matches Section (100% Liked) */}
          {perfectMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2 border-b border-gray-800 pb-2">
                🌟 %100 Uyumlu Filmler ({perfectMatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {perfectMatches.map(movie => (
                  <ResultMovieRow key={movie.id} movie={movie} membersCount={members.length} renderVoteBadge={renderVoteBadge} />
                ))}
              </div>
            </div>
          )}

          {/* 2. Partial Matches Section (50%+ Liked) */}
          {partialMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-sky-400 flex items-center gap-2 border-b border-gray-800 pb-2">
                🍿 Çoğunluğun Beğendikleri ({partialMatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partialMatches.map(movie => (
                  <ResultMovieRow key={movie.id} movie={movie} membersCount={members.length} renderVoteBadge={renderVoteBadge} />
                ))}
              </div>
            </div>
          )}

          {/* 3. Disliked/Other Movies Section */}
          {otherMovies.length > 0 && (
            <div className="space-y-4 pt-4">
              <details className="group border border-gray-850 bg-gray-900/40 rounded-2xl overflow-hidden transition">
                <summary className="font-extrabold text-sm text-gray-500 px-5 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-900 transition">
                  <span>💤 Kimsenin Beğenmediği Filmler ({otherMovies.length})</span>
                  <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                </summary>
                <div className="p-4 border-t border-gray-850 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-950/20">
                  {otherMovies.map(movie => (
                    <div key={movie.id} className="flex justify-between items-center bg-gray-950/40 border border-gray-850 p-3 rounded-xl">
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-gray-400 block truncate">{movie.title}</span>
                        <span className="text-[9px] text-gray-600 block">{movie.genre}</span>
                      </div>
                      <div className="flex gap-1">
                        {movie.voterDetails.map((voter, i) => (
                          <span key={i} title={`${voter.name} oyu`}>
                            {renderVoteBadge(voter.vote)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Random Picker Wheel Modal */}
      {showWheel && (
        <MatchWheel
          matchedMovies={finalWheelPool}
          onClose={() => setShowWheel(false)}
        />
      )}
    </div>
  );
}

// Inner Component for result rendering
function ResultMovieRow({ movie, membersCount, renderVoteBadge }) {
  const percent = Math.round((movie.likes / membersCount) * 100);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 items-start shadow-md hover:border-sky-500/20 transition">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-16 h-24 object-cover rounded-lg border border-gray-805 shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80";
        }}
      />
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-[96px]">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h4 className="font-bold text-sky-200 text-sm sm:text-base truncate" title={movie.title}>
              {movie.title}
            </h4>
            <span className="shrink-0 bg-sky-500/10 text-sky-400 text-[9px] px-1.5 py-0.5 rounded font-extrabold border border-sky-500/25">
              {movie.genre}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
            <span>⭐ {movie.rating}</span>
            <span>•</span>
            <span>⏱️ {movie.duration} dk</span>
            <span>•</span>
            <span className="font-semibold text-sky-500">{movie.platforms.join(', ')}</span>
          </div>
        </div>

        {/* Voter Breakdown */}
        <div className="mt-2 pt-2 border-t border-gray-850">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase">
              Beğeni: {movie.likes} / {membersCount} ({percent}%)
            </span>
            {/* Direct Trailer Link */}
            {movie.trailer && (
              <a
                href={movie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-red-400 hover:underline font-semibold"
              >
                🎥 Fragman
              </a>
            )}
          </div>

          {/* Voter bubble indicators */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {movie.voterDetails.map((voter, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-gray-950 px-1.5 py-0.5 rounded border border-gray-850"
                title={`${voter.name}: ${voter.vote === 'like' ? 'Beğendi' : (voter.vote === 'dislike' ? 'İstemiyor' : 'Kararsız')}`}
              >
                <span className="text-[10px]">{voter.avatar}</span>
                <span className="text-[9px] text-gray-400 max-w-[50px] truncate">{voter.name.split(" ")[0]}</span>
                {renderVoteBadge(voter.vote)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
