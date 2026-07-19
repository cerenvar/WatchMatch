import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// Bot taste presets to simulate realistic movie recommendations and votes
export const BOT_PRESETS = [
  { name: "Ceren (Bilim Kurgucu)", avatar: "👽", likes: ["Bilim Kurgu", "Aksiyon"], dislikes: ["Korku"], neutralChance: 0.2 },
  { name: "Ahmet (Korku Sever)", avatar: "👻", likes: ["Korku", "Gerilim"], dislikes: ["Komedi", "Animasyon"], neutralChance: 0.1 },
  { name: "Merve (Eğlenceli)", avatar: "🦄", likes: ["Komedi", "Animasyon", "Aksiyon"], dislikes: ["Suç", "Gerilim"], neutralChance: 0.3 },
  { name: "Can (Sanat Sever)", avatar: "🎨", likes: ["Dram", "Gizem", "Suç"], dislikes: ["Aksiyon"], neutralChance: 0.2 }
];

const getRoomIdFromHash = () => {
  if (window.location.hash === '#solo') return 'solo';
  const match = window.location.hash.match(/room=([0-9]+)/);
  return match ? match[1] : '';
};

export default function useRoomSync(initialMoviesPool, setPage) {
  const [roomId, setRoomId] = useState(() => getRoomIdFromHash());
  const [roomName, setRoomName] = useState(() => sessionStorage.getItem('mm_room_name') || 'Film Gecesi');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('mm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({ genres: [], platforms: [], minRating: 0, maxDuration: 240, language: '', maxMovieCount: 20 });
  const [roomMovies, setRoomMovies] = useState([]);
  const [votes, setVotes] = useState({});
  const [gameStarted, setGameStarted] = useState(false);

  const unsubscribeRef = useRef(null);

  const leaveRoom = useCallback(async () => {
    if (roomId && roomId !== 'solo' && currentUser) {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          const updatedMembers = (roomSnap.data().members || []).filter(m => m.name !== currentUser.name);
          await updateDoc(roomRef, { members: updatedMembers });
        }
      } catch (e) {
        console.error("Error leaving room:", e);
      }
    }

    if (unsubscribeRef.current) unsubscribeRef.current();

    setRoomId('');
    setRoomName('');
    setCurrentUser(null);
    setMembers([]);
    setVotes({});
    setGameStarted(false);
    window.location.hash = '';
    sessionStorage.removeItem('mm_current_user');
    sessionStorage.removeItem('mm_room_name');
    setPage('lobby');
  }, [roomId, currentUser, setPage]);

  const listenToRoom = useCallback((targetRoomId) => {
    if (unsubscribeRef.current) unsubscribeRef.current();

    unsubscribeRef.current = onSnapshot(doc(db, 'rooms', targetRoomId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.roomName) {
          setRoomName(data.roomName);
          sessionStorage.setItem('mm_room_name', data.roomName);
        }
        setMembers(data.members || []);
        setFilters(data.filters || { genres: [], platforms: [], minRating: 0, maxDuration: 240, language: '', maxMovieCount: 20 });
        setRoomMovies(data.roomMovies || []);
        setGameStarted(data.gameStarted || false);
        setVotes(data.votes || {});
      } else {
        alert("Oda bulunamadı veya silindi.");
        leaveRoom();
      }
    });
  }, [leaveRoom]);

  useEffect(() => {
    const handleHashChange = () => {
      const hashRoomId = getRoomIdFromHash();
      if (hashRoomId !== roomId) {
        if (!hashRoomId) leaveRoom();
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [roomId, leaveRoom]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  // Auto-navigate to Swiper or back to Lobby when game starts or resets
  useEffect(() => {
    if (roomId && roomId !== 'solo') {
      if (gameStarted) {
        setPage('swiper');
      } else {
        setPage('lobby');
      }
    }
  }, [gameStarted, roomId, setPage]);

  // If page is refreshed and we have a room, re-attach listener
  useEffect(() => {
    if (roomId && roomId !== 'solo' && currentUser) {
      listenToRoom(roomId);
    }
  }, [roomId, currentUser, listenToRoom]);


  const saveProfileAndHistory = (userName, avatar, targetRoomId, targetRoomName) => {
    localStorage.setItem('mm_saved_name', userName);
    localStorage.setItem('mm_saved_color_idx', localStorage.getItem('mm_saved_color_idx') || '0');

    if (targetRoomId && targetRoomId !== 'solo') {
      const uid = auth.currentUser?.uid || 'guest';
      const key = `mm_room_history_${uid}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      const newEntry = { code: targetRoomId, name: targetRoomName || `Oda #${targetRoomId}` };
      const updatedHistory = [newEntry, ...history.filter(r => {
        const existingCode = typeof r === 'object' ? r.code : r;
        return existingCode !== targetRoomId;
      })].slice(0, 4);
      localStorage.setItem(key, JSON.stringify(updatedHistory));
    }
  };

  const createRoom = async (userName, avatar, customRoomName) => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
      const finalRoomName = customRoomName?.trim() || `Oda #${newRoomId}`;
      const user = { name: userName, avatar, isHost: true, uid: auth.currentUser.uid };

      const initialRoomState = {
        roomName: finalRoomName,
        members: [user],
        filters: { genres: [], platforms: [], minRating: 0, maxDuration: 240, language: '', maxMovieCount: 20 },
        roomMovies: [],
        votes: { [userName]: {} },
        gameStarted: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'rooms', newRoomId), initialRoomState);

      setCurrentUser(user);
      setRoomId(newRoomId);
      window.location.hash = `room=${newRoomId}`;
      sessionStorage.setItem('mm_current_user', JSON.stringify(user));
      saveProfileAndHistory(userName, avatar, newRoomId, finalRoomName);

      listenToRoom(newRoomId);
      setPage('lobby');
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Oda oluşturulurken bir hata oluştu.");
    }
  };

  const joinRoom = async (targetRoomId, userName, avatar) => {
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      const roomRef = doc(db, 'rooms', targetRoomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        alert("Oda bulunamadı! Kodu kontrol edin.");
        return;
      }

      const user = { name: userName, avatar, isHost: false, uid: auth.currentUser.uid };
      const data = roomSnap.data();

      const existingMembers = data.members || [];
      if (!existingMembers.some(m => m.name === userName)) {
        await updateDoc(roomRef, {
          members: [...existingMembers, user],
          [`votes.${userName}`]: {}
        });
      }

      setCurrentUser(user);
      setRoomId(targetRoomId);
      window.location.hash = `room=${targetRoomId}`;
      sessionStorage.setItem('mm_current_user', JSON.stringify(user));
      saveProfileAndHistory(userName, avatar, targetRoomId, data.roomName);

      listenToRoom(targetRoomId);
      setPage('lobby');
    } catch (error) {
      console.error("Error joining room:", error);
      alert("Odaya katılırken bir hata oluştu.");
    }
  };

  const startSoloMode = useCallback((userName, avatar) => {
    const user = { name: userName, avatar, isHost: true, isSolo: true };
    const soloRoomName = "Keyfime Göre Öneriler";

    setCurrentUser(user);
    setRoomId('solo');
    setRoomName(soloRoomName);
    setMembers([user]);
    setVotes({ [userName]: {} });
    setGameStarted(false);

    window.location.hash = 'solo';
    sessionStorage.setItem('mm_current_user', JSON.stringify(user));
    sessionStorage.setItem('mm_room_name', soloRoomName);
    saveProfileAndHistory(userName, avatar, '', '');

    if (unsubscribeRef.current) unsubscribeRef.current();
    setPage('lobby');
  }, [setPage]);

  const addBotFriend = async (botPreset) => {
    if (!currentUser?.isHost) return;

    if (roomId === 'solo') {
      const newBot = { name: botPreset.name, avatar: botPreset.avatar, isHost: false, isBot: true, likes: botPreset.likes, dislikes: botPreset.dislikes, neutralChance: botPreset.neutralChance };
      setMembers(prev => [...prev, newBot]);
      setVotes(prev => ({ ...prev, [newBot.name]: {} }));
      return;
    }

    if (members.some(m => m.name === botPreset.name)) return;

    const newBot = {
      name: botPreset.name, avatar: botPreset.avatar, isHost: false, isBot: true,
      likes: botPreset.likes, dislikes: botPreset.dislikes, neutralChance: botPreset.neutralChance
    };

    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        members: [...members, newBot],
        [`votes.${newBot.name}`]: {}
      });
    } catch (e) {
      console.error("Error adding bot:", e);
    }
  };

  const updateFilters = async (newFilters) => {
    if (!currentUser?.isHost) return;
    if (roomId === 'solo') {
      setFilters(newFilters);
      return;
    }
    try {
      await updateDoc(doc(db, 'rooms', roomId), { filters: newFilters });
    } catch (e) {
      console.error("Error updating filters:", e);
    }
  };

  const startGame = async (externalMovies) => {
    if (!currentUser?.isHost) return;

    let filtered = externalMovies || [...initialMoviesPool];

    if (!externalMovies) {
      if (filters.genres.length > 0) filtered = filtered.filter(m => filters.genres.includes(m.genre));
      if (filters.platforms.length > 0) filtered = filtered.filter(m => m.platforms && m.platforms.some(p => filters.platforms.includes(p)));
      if (filters.minRating > 0) filtered = filtered.filter(m => parseFloat(m.rating || 0) >= filters.minRating);
      if (filters.maxDuration < 240) filtered = filtered.filter(m => (m.duration || 0) <= filters.maxDuration);
      if (filters.language) filtered = filtered.filter(m => m.language === filters.language);
    }

    let finalFiltered = filtered;
    if (finalFiltered.length === 0 && initialMoviesPool && initialMoviesPool.length > 0) {
      finalFiltered = [...initialMoviesPool];
    }
    let shuffled = finalFiltered.sort(() => 0.5 - Math.random());
    if (filters.maxMovieCount > 0) {
      shuffled = shuffled.slice(0, filters.maxMovieCount);
    }

    const simulatedVotes = {};
    members.forEach(member => {
      if (member.isBot) {
        const botVotes = {};
        shuffled.forEach(movie => {
          const rand = Math.random();
          if (member.likes.includes(movie.genre)) botVotes[movie.id] = rand > 0.15 ? 'like' : (rand > 0.05 ? 'neutral' : 'dislike');
          else if (member.dislikes.includes(movie.genre)) botVotes[movie.id] = rand > 0.8 ? 'like' : (rand > 0.6 ? 'neutral' : 'dislike');
          else botVotes[movie.id] = rand < member.neutralChance ? 'neutral' : (rand < 0.6 ? 'like' : 'dislike');
        });
        simulatedVotes[member.name] = botVotes;
      }
    });

    if (roomId === 'solo') {
      setRoomMovies(shuffled);
      setGameStarted(true);
      setVotes({ ...votes, ...simulatedVotes });
      setPage('swiper');
      return;
    }

    try {
      const updates = { roomMovies: shuffled, gameStarted: true };
      Object.keys(simulatedVotes).forEach(botName => {
        updates[`votes.${botName}`] = simulatedVotes[botName];
      });
      await updateDoc(doc(db, 'rooms', roomId), updates);
    } catch (e) {
      console.error("Error starting game:", e);
    }
  };

  const submitVote = async (movieId, vote) => {
    if (!currentUser) return;

    if (roomId === 'solo') {
      setVotes(prev => ({ ...prev, [currentUser.name]: { ...(prev[currentUser.name] || {}), [movieId]: vote } }));
      return;
    }

    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        [`votes.${currentUser.name}.${movieId}`]: vote
      });
    } catch (e) {
      console.error("Error submitting vote:", e);
    }
  };

  const resetGame = async () => {
    if (roomId === 'solo') {
      setGameStarted(false);
      setRoomMovies([]);
      setVotes({ [currentUser?.name || 'user']: {} });
      setPage('lobby');
      return;
    }

    if (!currentUser?.isHost) return;

    try {
      const updates = {
        gameStarted: false,
        roomMovies: [],
        votes: {}
      };
      members.forEach(member => {
        updates[`votes.${member.name}`] = {};
      });

      await updateDoc(doc(db, 'rooms', roomId), updates);
      setPage('lobby');
    } catch (e) {
      console.error("Error resetting game:", e);
    }
  };


  return {
    roomId, roomName, currentUser, members, filters, roomMovies, votes, gameStarted,
    createRoom, joinRoom, startSoloMode, addBotFriend, updateFilters, startGame, submitVote, leaveRoom, resetGame
  };
}
