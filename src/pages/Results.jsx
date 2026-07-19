import React, { useState } from 'react';
import MatchWheel from '../components/MatchWheel';
import { Star, Trophy, Users, Minus, X, Info } from 'lucide-react';
import Avatar from '../components/Avatar';

export default function Results({ roomMovies, votes, members, setPage, leaveRoom, confirmAction, currentUser, resetGame }) {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const calculateMatches = () => {
    return roomMovies.map(movie => {
      let score = 0;
      let likers = [];
      let dislikers = [];
      let neutrals = [];

      members.forEach(member => {
        const vote = votes[member.name]?.[movie.id];
        if (vote === 'like') {
          score += 2;
          likers.push(member);
        } else if (vote === 'dislike') {
          score -= 1;
          dislikers.push(member);
        } else if (vote === 'neutral') {
          score += 0.5;
          neutrals.push(member);
        }
      });

      const maxPossibleScore = members.length * 2;
      const matchPercentage = maxPossibleScore > 0 ? Math.round(Math.max(0, (score / maxPossibleScore) * 100)) : 0;

      return {
        ...movie,
        score,
        matchPercentage,
        likers,
        dislikers,
        neutrals,
        totalVotes: likers.length + dislikers.length + neutrals.length
      };
    }).sort((a, b) => b.score - a.score);
  };

  const results = calculateMatches();
  const topMatches = results.filter(r => r.score > 0).slice(0, 10);
  const bestMatch = topMatches.length > 0 ? topMatches[0] : null;

  const VoterList = ({ title, users, icon: Icon, colorClass }) => (
    users.length > 0 && (
      <div className="mb-4">
        <h5 className={`text-sm font-bold flex items-center gap-2 mb-2 ${colorClass}`}>
          <Icon className="w-4 h-4" /> {title} ({users.length})
        </h5>
        <div className="flex flex-wrap gap-2">
          {users.map((u, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-[#181D28] px-2.5 py-1.5 rounded-lg border border-[#1E2533]">
              <Avatar emoji={u.avatar} className="w-4 h-4" />
              <span className="text-xs font-semibold text-[#F5F7FA]">{u.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  );

  return (
    <div className="max-w-6xl mx-auto py-8 animate-fade-in px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-[#F5F7FA] tracking-tight mb-3">Oylama Sonuçları</h2>
        <p className="text-base text-[#ccb494] font-medium flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-[#5ca4a7]" /> {members.length} kişinin oyları hesaplandı
        </p>
      </div>

      {bestMatch ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Winner Card */}
          <div className="bg-[#11151E] rounded-3xl border border-[#22C55E]/30 p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#22C55E]/20 blur-[80px] rounded-full pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#22C55E]/20 p-3 rounded-2xl">
                  <Trophy className="w-8 h-8 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-[#22C55E] font-black text-xl uppercase tracking-wider">Gecenin Galibi</h3>
                  <p className="text-sm text-[#9CA3AF] font-bold">En Yüksek Eşleşme</p>
                </div>
              </div>

              <div className="flex gap-6 mb-6">
                <img src={bestMatch.poster} alt={bestMatch.title} className="w-32 h-48 object-cover rounded-xl shadow-lg border border-[#1E2533]" />
                <div className="flex-1">
                  <h4 className="text-2xl font-black text-[#F5F7FA] mb-2 leading-tight">{bestMatch.title}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#5ca4a7]/10 text-[#5ca4a7] text-xs font-bold px-2.5 py-1 rounded-md">{bestMatch.genre}</span>
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {bestMatch.rating}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-[#22C55E]">{bestMatch.matchPercentage}%</span>
                    <span className="text-sm font-bold text-[#9CA3AF] mb-1">Eşleşme Oranı</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#181D28] rounded-2xl p-4 border border-[#1E2533]">
                <VoterList title="Çok Beğenenler" users={bestMatch.likers} icon={Star} colorClass="text-[#22C55E]" />
                <VoterList title="İzleyebilirim Diyenler" users={bestMatch.neutrals} icon={Minus} colorClass="text-[#F59E0B]" />
                <VoterList title="İstemeyenler" users={bestMatch.dislikers} icon={X} colorClass="text-[#EF4444]" />
              </div>
            </div>
          </div>

          {/* Wheel Selector */}
          <div className="glass-panel rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center relative">
             <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#5ca4a7]/10 blur-[80px] rounded-full pointer-events-none" />
             <div className="text-center mb-6 z-10">
               <h3 className="text-xl font-black text-[#F5F7FA] mb-2">Kararsız Mısınız?</h3>
               <p className="text-sm text-[#9CA3AF] font-medium">İlk 10 film arasından rastgele birini seçmek için çarkı çevirin.</p>
             </div>
             <div className="z-10 w-full max-w-sm">
                <MatchWheel options={topMatches} onSelect={(movie) => setSelectedMovie(movie)} />
             </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#11151E] border border-[#1E2533] rounded-3xl shadow-lg">
          <Info className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#F5F7FA] mb-2">Henüz yeterli eşleşme yok</h3>
          <p className="text-[#9CA3AF]">Oy verdikçe sonuçlar burada belirecektir.</p>
        </div>
      )}

      {/* Leaderboard */}
      {topMatches.length > 1 && (
        <div className="bg-[#11151E] border border-[#1E2533] rounded-3xl p-6 md:p-8 shadow-xl">
          <h3 className="text-xl font-black text-[#F5F7FA] mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-[#F59E0B]" /> Diğer Güçlü Eşleşmeler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMatches.slice(1).map((movie, index) => (
              <div key={movie.id} className="flex items-center gap-4 bg-[#181D28] border border-[#1E2533] p-4 rounded-2xl hover:border-[#5ca4a7]/50 transition group cursor-pointer" onClick={() => setSelectedMovie(movie)}>
                <div className="w-10 h-10 rounded-xl bg-[#11151E] border border-[#1E2533] flex items-center justify-center font-black text-lg text-[#ccb494] group-hover:text-[#5ca4a7] transition">
                  {index + 2}
                </div>
                <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-[#F5F7FA] truncate group-hover:text-white transition">{movie.title}</h4>
                  <div className="text-xs font-semibold text-[#9CA3AF] mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[#22C55E]" /> {movie.likers.length} Beğeni</span>
                    <span className="flex items-center gap-1"><Minus className="w-3.5 h-3.5 text-[#F59E0B]" /> {movie.neutrals.length} Nötr</span>
                  </div>
                </div>
                <div className="text-xl font-black text-[#22C55E] bg-[#22C55E]/10 px-3 py-1.5 rounded-xl">
                  {movie.matchPercentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Movie Detail Modal/Overlay - simple implementation */}
      {selectedMovie && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedMovie(null)}>
           <div className="bg-[#11151E] border border-[#1E2533] p-6 rounded-3xl max-w-lg w-full shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-[#F5F7FA]">{selectedMovie.title}</h3>
                <button onClick={() => setSelectedMovie(null)} className="p-2 bg-[#181D28] rounded-full text-[#9CA3AF] hover:text-white transition"><X className="w-5 h-5" /></button>
             </div>
             <div className="flex gap-6 mb-6">
                <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-32 h-48 object-cover rounded-xl" />
                <div>
                   <p className="text-[#9CA3AF] text-sm mb-4 leading-relaxed">{selectedMovie.note}</p>
                   <div className="flex flex-wrap gap-2 mb-4">
                     {selectedMovie.platforms.map(p => <span key={p} className="text-xs font-bold px-2.5 py-1 bg-white/10 text-white rounded-md">{p}</span>)}
                   </div>
                   <div className="text-3xl font-black text-[#22C55E]">{selectedMovie.matchPercentage}% Eşleşme</div>
                </div>
             </div>
             <div className="space-y-4">
                <VoterList title="Beğenenler" users={selectedMovie.likers} icon={Star} colorClass="text-[#22C55E]" />
                <VoterList title="Kararsızlar" users={selectedMovie.neutrals} icon={Minus} colorClass="text-[#F59E0B]" />
                <VoterList title="Geçenler" users={selectedMovie.dislikers} icon={X} colorClass="text-[#EF4444]" />
             </div>
           </div>
        </div>
      )}

      {/* Reset & Back Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-6 border-t border-white/[0.06]">
        {currentUser?.isHost ? (
          <button
            onClick={() => confirmAction("Tüm oyları sıfırlayıp lobiye dönmek ve yeni oylama başlatmak istiyor musunuz?", resetGame, "Oylamayı Sıfırla")}
            className="px-8 py-4 rounded-2xl glass-btn-primary font-black text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
          >
            🔄 Oylamayı Sıfırla ve Lobiye Dön
          </button>
        ) : (
          <button
            onClick={() => setPage('lobby')}
            className="px-8 py-4 rounded-2xl glass-btn-secondary font-black text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
          >
            🏠 Lobiye Geri Dön
          </button>
        )}

        <button
          onClick={() => confirmAction("Odadan ayrılmak istediğinize emin misiniz?", leaveRoom, "Odadan Ayrıl")}
          className="px-8 py-4 rounded-2xl bg-transparent border border-[#EF4444]/30 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/50 text-[#EF4444] font-black text-sm uppercase tracking-wider flex items-center gap-2 transition cursor-pointer w-full sm:w-auto justify-center"
        >
          🚪 Odadan Ayrıl
        </button>
      </div>

    </div>
  );
}
