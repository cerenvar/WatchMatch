import { useState, useEffect, useRef } from 'react';

// Bot taste presets to simulate realistic movie recommendations and votes
export const BOT_PRESETS = [
  { name: "Ceren (Bilim Kurgucu)", avatar: "👽", likes: ["Bilim Kurgu", "Aksiyon"], dislikes: ["Korku"], neutralChance: 0.2 },
  { name: "Ahmet (Korku Sever)", avatar: "👻", likes: ["Korku", "Gerilim"], dislikes: ["Komedi", "Animasyon"], neutralChance: 0.1 },
  { name: "Merve (Eğlenceli)", avatar: "🦄", likes: ["Komedi", "Animasyon", "Aksiyon"], dislikes: ["Suç", "Gerilim"], neutralChance: 0.3 },
  { name: "Can (Sanat Sever)", avatar: "🎨", likes: ["Dram", "Gizem", "Suç"], dislikes: ["Aksiyon"], neutralChance: 0.2 }
];

// Helper to get room ID from URL hash (e.g. #room=123456)
const getRoomIdFromHash = () => {
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
  const [filters, setFilters] = useState({
    genres: [],
    platforms: [],
    minRating: 0,
    maxDuration: 240,
    language: ''
  });
  const [roomMovies, setRoomMovies] = useState([]);
  const [votes, setVotes] = useState({}); // { username: { movieId: 'like' | 'dislike' | 'neutral' } }
  const [gameStarted, setGameStarted] = useState(false);

  const channelRef = useRef(null);

  // Sync state if URL hash changes (e.g. user goes back or manually enters a room link)
  useEffect(() => {
    const handleHashChange = () => {
      const hashRoomId = getRoomIdFromHash();
      if (hashRoomId !== roomId) {
        setRoomId(hashRoomId);
        if (!hashRoomId) {
          // Cleared hash -> reset room state
          setCurrentUser(null);
          setMembers([]);
          setVotes({});
          setGameStarted(false);
          localStorage.removeItem('mm_current_user');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [roomId]);

  // Initialize BroadcastChannel when roomId changes
  useEffect(() => {
    if (!roomId || roomId === 'solo') {
      channelRef.current = null;
      return;
    }

    const channel = new BroadcastChannel(`watchmatch_${roomId}`);
    channelRef.current = channel;

    // Listen for incoming sync messages
    channel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'JOIN_REQUEST':
          // Host receives this and registers the new user, then sends back an acknowledgment with the full state
          if (currentUser?.isHost) {
            setMembers((prev) => {
              if (prev.some(m => m.name === payload.user.name)) return prev;
              const newMembers = [...prev, { ...payload.user, isHost: false }];

              // Broadcast acknowledgment with state to the whole channel
              channel.postMessage({
                type: 'JOIN_ACK',
                payload: {
                  roomName,
                  members: newMembers,
                  filters,
                  movies: roomMovies,
                  gameStarted,
                  votes
                }
              });
              return newMembers;
            });
          }
          break;

        case 'JOIN_ACK':
          // The joining member receives the state from the host
          if (!currentUser?.isHost) {
            const hostRoomName = payload.roomName || `Oda #${roomId}`;
            setRoomName(hostRoomName);
            sessionStorage.setItem('mm_room_name', hostRoomName);
            setMembers(payload.members);
            setFilters(payload.filters);
            setRoomMovies(payload.movies);
            setGameStarted(payload.gameStarted);
            setVotes(payload.votes);
            saveProfileAndHistory(currentUser.name, currentUser.avatar, roomId, hostRoomName);
          }
          break;

        case 'STATE_SYNC':
          // Synchronize states
          if (payload.roomName) {
            setRoomName(payload.roomName);
            sessionStorage.setItem('mm_room_name', payload.roomName);
          }
          setMembers(payload.members);
          setFilters(payload.filters);
          setRoomMovies(payload.movies);
          setGameStarted(payload.gameStarted);
          setVotes(payload.votes);
          break;

        case 'START_GAME':
          setRoomMovies(payload.movies);
          setGameStarted(true);
          setPage('swiper');
          break;

        case 'VOTE_SUBMIT':
          setVotes((prev) => {
            const userVotes = prev[payload.userName] || {};
            const newVotes = {
              ...prev,
              [payload.userName]: {
                ...userVotes,
                [payload.movieId]: payload.vote
              }
            };
            // If host, sync state to others
            if (currentUser?.isHost) {
              triggerSync(members, filters, roomMovies, gameStarted, newVotes);
            }
            return newVotes;
          });
          break;

        case 'LEAVE_ROOM':
          setMembers((prev) => {
            const updated = prev.filter(m => m.name !== payload.userName);
            if (currentUser?.isHost) {
              triggerSync(updated, filters, roomMovies, gameStarted, votes);
            }
            return updated;
          });
          break;

        default:
          break;
      }
    };

    // If joining, broadcast our arrival request
    if (currentUser && !currentUser.isHost) {
      channel.postMessage({
        type: 'JOIN_REQUEST',
        payload: { user: currentUser }
      });
    }

    return () => {
      channel.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, currentUser?.isHost]);

  // Helper to sync state from host to other members
  const triggerSync = (updatedMembers, updatedFilters, updatedMovies, updatedStarted, updatedVotes) => {
    if (channelRef.current && currentUser?.isHost) {
      channelRef.current.postMessage({
        type: 'STATE_SYNC',
        payload: {
          roomName,
          members: updatedMembers,
          filters: updatedFilters,
          movies: updatedMovies,
          gameStarted: updatedStarted,
          votes: updatedVotes
        }
      });
    }
  };

  // Helper to save profile and history to local storage
  const saveProfileAndHistory = (userName, avatar, targetRoomId, targetRoomName) => {
    localStorage.setItem('mm_saved_name', userName);
    localStorage.setItem('mm_saved_avatar', avatar);

    if (targetRoomId) {
      const history = JSON.parse(localStorage.getItem('mm_room_history') || '[]');
      const newEntry = { code: targetRoomId, name: targetRoomName || `Oda #${targetRoomId}` };
      const updatedHistory = [newEntry, ...history.filter(r => {
        const existingCode = typeof r === 'object' ? r.code : r;
        return existingCode !== targetRoomId;
      })].slice(0, 4);
      localStorage.setItem('mm_room_history', JSON.stringify(updatedHistory));
    }
  };

  // 1. CREATE ROOM
  const createRoom = (userName, avatar, customRoomName) => {
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
    const finalRoomName = customRoomName?.trim() || `Oda #${newRoomId}`;
    const user = { name: userName, avatar, isHost: true };

    setCurrentUser(user);
    setRoomId(newRoomId);
    setRoomName(finalRoomName);
    setMembers([user]);
    setVotes({ [userName]: {} });
    setGameStarted(false);

    window.location.hash = `room=${newRoomId}`;
    sessionStorage.setItem('mm_current_user', JSON.stringify(user));
    sessionStorage.setItem('mm_room_name', finalRoomName);
    saveProfileAndHistory(userName, avatar, newRoomId, finalRoomName);
    setPage('lobby');
  };

  // 2. JOIN ROOM
  const joinRoom = (targetRoomId, userName, avatar) => {
    const user = { name: userName, avatar, isHost: false };
    const tempRoomName = `Oda #${targetRoomId}`;

    setCurrentUser(user);
    setRoomId(targetRoomId);
    setRoomName(tempRoomName);
    setMembers([user]); // Host will overwrite this with JOIN_ACK
    setVotes({ [userName]: {} });
    setGameStarted(false);

    window.location.hash = `room=${targetRoomId}`;
    sessionStorage.setItem('mm_current_user', JSON.stringify(user));
    sessionStorage.setItem('mm_room_name', tempRoomName);
    saveProfileAndHistory(userName, avatar, targetRoomId, tempRoomName);
    setPage('lobby');
  };

  // 2b. START SOLO MODE
  const startSoloMode = (userName, avatar) => {
    const user = { name: userName, avatar, isHost: true, isSolo: true };
    const soloRoomName = "Keyfime Göre Öneriler 🍿";

    setCurrentUser(user);
    setRoomId('solo');
    setRoomName(soloRoomName);
    setMembers([user]);
    setVotes({ [userName]: {} });
    setGameStarted(false);

    window.location.hash = 'solo';
    sessionStorage.setItem('mm_current_user', JSON.stringify(user));
    sessionStorage.setItem('mm_room_name', soloRoomName);
    saveProfileAndHistory(userName, avatar, '', ''); // Don't save 'solo' in history
    setPage('lobby');
  };

  // 3. ADD VIRTUAL BOT FRIEND
  const addBotFriend = (botPreset) => {
    if (!currentUser?.isHost) return;

    // Check if bot already exists in members
    if (members.some(m => m.name === botPreset.name)) return;

    const newBot = {
      name: botPreset.name,
      avatar: botPreset.avatar,
      isHost: false,
      isBot: true,
      likes: botPreset.likes,
      dislikes: botPreset.dislikes,
      neutralChance: botPreset.neutralChance
    };

    const newMembers = [...members, newBot];
    setMembers(newMembers);

    // Initial empty votes for bot
    setVotes((prev) => ({
      ...prev,
      [newBot.name]: {}
    }));

    triggerSync(newMembers, filters, roomMovies, gameStarted, { ...votes, [newBot.name]: {} });
  };

  // 4. UPDATE FILTERS (Host Only)
  const updateFilters = (newFilters) => {
    if (!currentUser?.isHost) return;
    setFilters(newFilters);
    triggerSync(members, newFilters, roomMovies, gameStarted, votes);
  };

  // 5. START GAME (Host Only)
  const startGame = () => {
    if (!currentUser?.isHost) return;

    // Filter movies based on rules
    let filtered = [...initialMoviesPool];

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(m => filters.genres.includes(m.genre));
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      filtered = filtered.filter(m =>
        m.platforms.some(p => filters.platforms.includes(p))
      );
    }

    // Min rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(m => parseFloat(m.rating) >= filters.minRating);
    }

    // Max duration filter
    if (filters.maxDuration < 240) {
      filtered = filtered.filter(m => m.duration <= filters.maxDuration);
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(m => m.language === filters.language);
    }

    // Shuffle matching movies (do not limit or slice so all films are in the pool)
    const shuffled = filtered.sort(() => 0.5 - Math.random());

    setRoomMovies(shuffled);
    setGameStarted(true);

    // Simulate bot votes immediately (or dynamically, but doing it now is clean)
    const updatedVotes = { ...votes };
    members.forEach(member => {
      if (member.isBot) {
        const botVotes = {};
        shuffled.forEach(movie => {
          // Determine bot vote based on bot preferences
          const rand = Math.random();
          if (member.likes.includes(movie.genre)) {
            botVotes[movie.id] = rand > 0.15 ? 'like' : (rand > 0.05 ? 'neutral' : 'dislike');
          } else if (member.dislikes.includes(movie.genre)) {
            botVotes[movie.id] = rand > 0.8 ? 'like' : (rand > 0.6 ? 'neutral' : 'dislike');
          } else {
            // General chance
            if (rand < member.neutralChance) {
              botVotes[movie.id] = 'neutral';
            } else if (rand < 0.6) {
              botVotes[movie.id] = 'like';
            } else {
              botVotes[movie.id] = 'dislike';
            }
          }
        });
        updatedVotes[member.name] = botVotes;
      }
    });

    setVotes(updatedVotes);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'START_GAME',
        payload: { movies: shuffled }
      });
    }

    triggerSync(members, filters, shuffled, true, updatedVotes);
    setPage('swiper');
  };

  // 6. SUBMIT VOTE (Any player)
  const submitVote = (movieId, vote) => {
    if (!currentUser) return;

    setVotes((prev) => {
      const userVotes = prev[currentUser.name] || {};
      const newVotes = {
        ...prev,
        [currentUser.name]: {
          ...userVotes,
          [movieId]: vote
        }
      };

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'VOTE_SUBMIT',
          payload: {
            userName: currentUser.name,
            movieId,
            vote
          }
        });
      }

      // If not host, host will get VOTE_SUBMIT and sync. If host, sync directly.
      if (currentUser.isHost) {
        triggerSync(members, filters, roomMovies, gameStarted, newVotes);
      }

      return newVotes;
    });
  };

  // 7. LEAVE ROOM
  const leaveRoom = () => {
    if (channelRef.current && currentUser) {
      channelRef.current.postMessage({
        type: 'LEAVE_ROOM',
        payload: { userName: currentUser.name }
      });
    }

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
  };

  return {
    roomId,
    roomName,
    currentUser,
    members,
    filters,
    roomMovies,
    votes,
    gameStarted,
    createRoom,
    joinRoom,
    startSoloMode,
    addBotFriend,
    updateFilters,
    startGame,
    submitVote,
    leaveRoom
  };
}
