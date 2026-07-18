const fs = require('fs');
const path = 'src/hooks/useRoomSync.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find start and end of leaveRoom
let leaveRoomStart = lines.findIndex(l => l.includes('const leaveRoom = useCallback(async () => {'));
let leaveRoomEnd = -1;
for (let i = leaveRoomStart; i < lines.length; i++) {
  if (lines[i].includes('  }, [roomId, currentUser, setPage]);')) {
    leaveRoomEnd = i;
    break;
  }
}

if (leaveRoomStart !== -1 && leaveRoomEnd !== -1) {
  // Extract leaveRoom
  const leaveRoomBlock = lines.splice(leaveRoomStart, leaveRoomEnd - leaveRoomStart + 1);
  
  // Find where to insert (after unsubscribeRef)
  let insertIdx = lines.findIndex(l => l.includes('const unsubscribeRef = useRef(null);'));
  
  if (insertIdx !== -1) {
    // Insert leaveRoomBlock
    lines.splice(insertIdx + 1, 0, '', ...leaveRoomBlock);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully moved leaveRoom to the top.');
  } else {
    console.log('Could not find insert location.');
  }
} else {
  console.log('Could not find leaveRoom block.', leaveRoomStart, leaveRoomEnd);
}
