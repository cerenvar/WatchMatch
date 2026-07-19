import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function Auth() {
  // Load posters dynamically from the active film database pool, or use popular fallbacks
  const getPosterUrls = () => {
    try {
      const saved = localStorage.getItem('film_match_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validPosters = parsed.map(m => m.poster).filter(Boolean);
          if (validPosters.length > 0) return validPosters;
        }
      }
    } catch (e) {
      console.error("Failed to load local storage posters:", e);
    }
    
    // Most popular iconic movie posters as fallback
    return [
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // The Dark Knight
      "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", // Lord of the Rings
      "https://image.tmdb.org/t/p/w500/8c4a8kE7PizaGQQnditMmI1xbRp.jpg", // The Matrix
      "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8SPzMmiq.jpg", // Pulp Fiction
      "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
      "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", // Avengers: Infinity War
      "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", // Inception
      "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg", // Forrest Gump
      "https://image.tmdb.org/t/p/w500/m8eFedsS7vQCZCS8WGp5L1bVDjT.jpg", // Fight Club
      "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", // The Shawshank Redemption
      "https://image.tmdb.org/t/p/w500/velWPhVMQeIcbLWE3sydOReGjZN.jpg", // Interstellar
      "https://image.tmdb.org/t/p/w500/5aGhaI4gQIFv6W3lq8A1n8OAZp4.jpg"  // Spider-Man
    ];
  };

  const [posters] = useState(() => {
    const pool = getPosterUrls();
    // Shuffle the posters to show a dynamic variety on every page load
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, 12);
    // Fill to 12 if less than 12
    if (selected.length > 0 && selected.length < 12) {
      while (selected.length < 12) {
        selected = [...selected, ...selected];
      }
      selected = selected.slice(0, 12);
    }
    return selected;
  });

  const scrollPosters = [...posters, ...posters];

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setError('Lütfen adınızı girin.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCred.user, {
          displayName: displayName.trim()
        });
        // Force state reload
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Geçersiz e-posta adresi.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('E-posta adresi veya şifre hatalı.');
          break;
        case 'auth/email-already-in-use':
          setError('Bu e-posta adresi zaten kullanımda.');
          break;
        case 'auth/weak-password':
          setError('Şifre en az 6 karakter olmalıdır.');
          break;
        case 'auth/operation-not-allowed':
          setError('E-posta/Şifre girişi Firebase üzerinde etkin değil. Lütfen Firebase Console > Authentication > Sign-in method sekmesinden "Email/Password" seçeneğini aktif edin.');
          break;
        default:
          setError(`Bir hata oluştu: ${err.message || 'Lütfen tekrar deneyin.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError('');
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error(err);
      setError('Hızlı giriş başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-[#030708] via-[#071113] to-[#0a1619] px-4 py-12 overflow-hidden font-['Inter',sans-serif]">
      {/* Background decoration with custom colors */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,100,101,0.18)_0%,rgba(10,22,25,0.05)_50%,transparent_100%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5ca4a7]/12 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#076465]/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=60')" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030708] via-transparent to-[#030708] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Interactive Cinematic Collage & Intro (7 cols) */}
        <div className="lg:col-span-7 hidden lg:flex flex-col space-y-8 pr-6 text-white">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#5ca4a7]/10 border border-[#5ca4a7]/20 text-[#5ca4a7] text-xs font-black uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(92,164,167,0.15)]">
              🎬 WatchMatch Premium
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              Ortak Film Zevkinizi <br />
              <span className="bg-gradient-to-r from-[#5ca4a7] via-[#f4ac5c] to-[#ccb494] bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(244,172,92,0.15)]">
                Birlikte Keşfedin.
              </span>
            </h1>
            <p className="text-gray-400 font-semibold text-sm leading-relaxed max-w-lg">
              Arkadaşlarınızla sinema gecelerinizi oylama paneli ve Firebase canlı senkronizasyon altyapısıyla eğlenceli bir yarışa dönüştürün.
            </p>
          </div>

          {/* Scrolling Movie Posters Collage */}
          <div className="relative h-[250px] w-full flex items-center justify-start overflow-hidden rounded-[2rem] bg-white/[0.01] border border-white/[0.04] p-6 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#030708]/80 pointer-events-none z-10" />
            <div className="flex gap-4 animate-[scroll_35s_linear_infinite]">
              {scrollPosters.map((src, i) => (
                <div
                  key={i}
                  className="w-[130px] h-[190px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg transform rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-300 shrink-0"
                >
                  <img src={src} className="w-full h-full object-cover" alt="Cinema Poster" />
                </div>
              ))}
            </div>
          </div>

          {/* Glowing Quote */}
          <div className="p-5 border-l-2 border-[#f4ac5c] bg-white/[0.01] rounded-r-2xl max-w-lg">
            <p className="italic text-xs font-semibold text-gray-300">
              "İki insanın aynı filmi sevmesi, ortak bir dünyanın kapısını aralar."
            </p>
            <span className="block text-[10px] font-extrabold text-[#ccb494] uppercase tracking-wider mt-2.5">
              — WatchMatch
            </span>
          </div>
        </div>

        {/* Right Column: Authentication Card (5 cols) */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="relative w-full max-w-md glass-panel p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-white">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo size="lg" subtitle="Birlikte Keşfetmeye Başlayın" />
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-white/[0.06] mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 pb-3 text-sm font-bold transition border-b-2 cursor-pointer ${isLogin
                  ? 'border-[#5ca4a7] text-[#F5F7FA]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F5F7FA]'
                  }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 pb-3 text-sm font-bold transition border-b-2 cursor-pointer ${!isLogin
                  ? 'border-[#5ca4a7] text-[#F5F7FA]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F5F7FA]'
                  }`}
              >
                Kayıt Ol
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-[#ccb494] mb-1.5 uppercase tracking-wider">İsim</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Kullanıcı adınız"
                      className="w-full px-4.5 py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm focus:outline-none focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 text-white transition-all duration-300 font-semibold shadow-inner"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#ccb494] mb-1.5 uppercase tracking-wider">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@eposta.com"
                    className="w-full px-4.5 py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm focus:outline-none focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 text-white transition-all duration-300 font-semibold shadow-inner"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#ccb494] mb-1.5 uppercase tracking-wider">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-4.5 py-2.5 pl-10 pr-10 rounded-xl bg-white/[0.02] border border-white/[0.08] text-sm focus:outline-none focus:border-[#5ca4a7] focus:ring-2 focus:ring-[#5ca4a7]/20 text-white transition-all duration-300 font-semibold shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary disabled:opacity-50 font-bold py-3.5 rounded-xl transition mt-6 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#050b0c] border-t-transparent rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="px-3 text-xs font-bold text-[#ccb494] uppercase tracking-widest">veya</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Guest Continue */}
            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="w-full glass-btn-secondary py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 font-extrabold"
            >
              Kayıt Olmadan Devam Et
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
