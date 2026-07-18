import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-b from-[#0c0208] via-[#15030f] to-[#200416] px-4 py-12 overflow-hidden font-['Inter',sans-serif]">
      {/* Background decoration with custom colors: #490a35 and #7d0d5a */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,13,90,0.18)_0%,rgba(73,10,53,0.05)_50%,transparent_100%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#bd3191]/12 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#7d0d5a]/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=60')" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0208] via-transparent to-[#0c0208] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-[#11151E]/80 backdrop-blur-xl border border-[#1E2533] p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">

        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8 select-none">
          <img src="/logo.png" className="w-14 h-14 rounded-2xl object-cover mb-3 shadow-[0_0_20px_rgba(189,49,145,0.25)] border border-[#bd3191]/20 animate-pulse" alt="Logo" />
          <h1 className="text-2xl font-black text-[#F5F7FA] tracking-tight">
            Watch<span className="text-[#bd3191]">Match</span>
          </h1>
          <p className="text-xs text-[#9CA3AF] font-medium mt-1">
            Birlikte Keşfetmeye Başlayın
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#1E2533] mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${isLogin
                ? 'border-[#bd3191] text-[#F5F7FA]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#F5F7FA]'
              }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${!isLogin
                ? 'border-[#bd3191] text-[#F5F7FA]'
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
              <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">İsim</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Kullanıcı adınız"
                  className="w-full bg-[#181D28]/60 border border-[#1E2533] focus:border-[#bd3191]/50 focus:ring-1 focus:ring-[#bd3191]/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4B5563] outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                className="w-full bg-[#181D28]/60 border border-[#1E2533] focus:border-[#bd3191]/50 focus:ring-1 focus:ring-[#bd3191]/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#4B5563] outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#9CA3AF] mb-1.5 uppercase tracking-wider">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#181D28]/60 border border-[#1E2533] focus:border-[#bd3191]/50 focus:ring-1 focus:ring-[#bd3191]/50 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#4B5563] outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#9CA3AF] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#bd3191] hover:bg-[#7d0d5a] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#bd3191]/20 hover:shadow-[#bd3191]/40 mt-6 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
            )}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#1E2533]" />
          <span className="px-3 text-xs font-bold text-[#4B5563] uppercase tracking-widest">veya</span>
          <div className="flex-1 h-px bg-[#1E2533]" />
        </div>

        {/* Guest Continue */}
        <button
          onClick={handleAnonymous}
          disabled={loading}
          className="w-full bg-[#181D28]/80 hover:bg-[#1E2533] text-[#F5F7FA] font-bold py-3 rounded-xl border border-[#1E2533] transition cursor-pointer flex items-center justify-center gap-2"
        >
          Kayıt Olmadan Devam Et
        </button>

      </div>
    </div>
  );
}
