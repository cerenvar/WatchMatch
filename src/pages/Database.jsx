import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import MovieForm from '../components/MovieForm';

export default function Database({ movies, onSubmitMovie, onDeleteMovie, editingMovie, setEditingMovie, resetToDefaults, fetchFromTmdb, confirmAction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterGenre, setFilterGenre] = useState('All');

  const platforms = ['All', ...new Set(movies.flatMap(m => m.platforms || []))];
  const genres = ['All', ...new Set(movies.map(m => m.genre))];

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'All' || (m.platforms && m.platforms.includes(filterPlatform));
    const matchesGenre = filterGenre === 'All' || m.genre === filterGenre;
    return matchesSearch && matchesPlatform && matchesGenre;
  });

  return (
    <div className="animate-fade-in px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#F5F7FA] tracking-tight">Film Havuzu</h2>
          <p className="text-sm text-[#9CA3AF] font-medium mt-1">
            Toplam {movies.length} kayıtlı film/dizi bulunuyor
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (confirmAction) {
                confirmAction("TMDb'den 300+ film çekmek istediğinize emin misiniz? (API anahtarınızın kayıtlı olması gerekir)", fetchFromTmdb, "Filmleri Çek");
              } else {
                fetchFromTmdb();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] text-[#F5F7FA] shadow-md cursor-pointer"
          >
            TMDb'den Film Çek
          </button>
          
          <button
            onClick={() => {
              if (confirmAction) {
                confirmAction("Tüm filmleri silip varsayılan 15 filme dönmek istediğinize emin misiniz?", resetToDefaults, "Sıfırla");
              } else {
                resetToDefaults();
              }
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/35 shadow-md cursor-pointer"
          >
            Sıfırla
          </button>

          <button
            onClick={() => document.getElementById('add-movie-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass-btn-primary px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Yeni Film Ekle
          </button>
        </div>
      </div>

      <div className="glass-panel-glow p-4.5 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Film adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 rounded-xl outline-none text-[#F5F7FA] placeholder-gray-500 transition-all duration-300 text-sm font-semibold shadow-inner"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="pl-9 pr-8 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 text-[#F5F7FA] appearance-none cursor-pointer transition-all duration-300 text-sm font-semibold min-w-[160px] shadow-inner"
            >
              {platforms.map(p => <option key={p} value={p} className="bg-[#090B10] text-[#F5F7FA]">{p === 'All' ? 'Tüm Platformlar' : p}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="pl-9 pr-8 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 text-[#F5F7FA] appearance-none cursor-pointer transition-all duration-300 text-sm font-semibold min-w-[140px] shadow-inner"
            >
              {genres.map(g => <option key={g} value={g} className="bg-[#090B10] text-[#F5F7FA]">{g === 'All' ? 'Tüm Türler' : g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-[#11151E]/60 backdrop-blur-md border border-[#bd3191]/15 rounded-2xl">
          <Search className="w-12 h-12 text-[#4B5563] mx-auto mb-4" />
          <p className="text-lg text-[#9CA3AF] font-medium">Arama kriterlerine uygun film bulunamadı.</p>
          <button
            onClick={() => { setSearchTerm(''); setFilterPlatform('All'); setFilterGenre('All'); }}
            className="mt-4 text-[#5ca4a7] font-bold hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
          {filteredMovies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onDelete={onDeleteMovie}
              onEdit={(m) => {
                setEditingMovie(m);
                setTimeout(() => document.getElementById('add-movie-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
            />
          ))}
        </div>
      )}
      
      {/* Movie Form */}
      <div id="add-movie-form" className="mt-12 glass-panel p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <h3 className="text-xl font-black text-[#F5F7FA] mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#5ca4a7]" /> 
          {editingMovie ? 'Filmi Düzenle' : 'Yeni Film Ekle'}
        </h3>
        <MovieForm 
          onSubmit={onSubmitMovie} 
          initialData={editingMovie} 
          onCancel={editingMovie ? () => setEditingMovie(null) : undefined} 
        />
      </div>
    </div>
  );
}
