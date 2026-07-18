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
            className="bg-[#1E2533] hover:bg-[#283142] text-[#F5F7FA] border border-[#283142] px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
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
            className="bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            Sıfırla
          </button>

          <button
            onClick={() => document.getElementById('add-movie-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#bd3191] hover:bg-[#7d0d5a] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-[#bd3191]/20 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Yeni Film Ekle
          </button>
        </div>
      </div>

      <div className="bg-[#11151E]/60 backdrop-blur-md border border-[#bd3191]/15 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 shadow-2xl">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Film adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#11151E]/40 border border-[#1E2533]/60 rounded-xl focus:outline-none focus:border-[#bd3191] focus:ring-1 focus:ring-[#bd3191]/20 text-[#F5F7FA] placeholder-[#4B5563] transition text-sm"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="pl-9 pr-8 py-3 bg-[#11151E]/40 border border-[#1E2533]/60 rounded-xl focus:outline-none focus:border-[#bd3191] focus:ring-1 focus:ring-[#bd3191]/20 text-[#F5F7FA] appearance-none cursor-pointer transition text-sm font-medium min-w-[140px]"
            >
              {platforms.map(p => <option key={p} value={p} className="bg-[#181D28] text-white">{p === 'All' ? 'Tüm Platformlar' : p}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="pl-9 pr-8 py-3 bg-[#11151E]/40 border border-[#1E2533]/60 rounded-xl focus:outline-none focus:border-[#bd3191] focus:ring-1 focus:ring-[#bd3191]/20 text-[#F5F7FA] appearance-none cursor-pointer transition text-sm font-medium min-w-[140px]"
            >
              {genres.map(g => <option key={g} value={g} className="bg-[#181D28] text-white">{g === 'All' ? 'Tüm Türler' : g}</option>)}
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
            className="mt-4 text-[#bd3191] font-bold hover:underline"
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
      <div id="add-movie-form" className="mt-12 bg-[#11151E]/60 backdrop-blur-md border border-[#bd3191]/15 p-6 md:p-8 rounded-3xl shadow-2xl">
        <h3 className="text-xl font-black text-[#F5F7FA] mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6 text-[#bd3191]" /> 
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
