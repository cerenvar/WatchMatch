const fs = require('fs');
const path = 'src/hooks/useRoomSync.js';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find start and end of listenToRoom
let listenStart = lines.findIndex(l => l.includes('const listenToRoom = useCallback((targetRoomId) => {'));
let listenEnd = -1;
if (listenStart !== -1) {
  for (let i = listenStart; i < lines.length; i++) {
    if (lines[i].includes('  }, [leaveRoom]);')) {
      listenEnd = i;
      break;
    }
  }
}

if (listenStart !== -1 && listenEnd !== -1) {
  // Extract listenToRoom
  const listenBlock = lines.splice(listenStart, listenEnd - listenStart + 1);
  
  // Find where to insert (after leaveRoom block)
  // leaveRoom ends with "  }, [roomId, currentUser, setPage]);"
  let insertIdx = lines.findIndex(l => l.includes('  }, [roomId, currentUser, setPage]);'));
  
  if (insertIdx !== -1) {
    lines.splice(insertIdx + 1, 0, '', ...listenBlock);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully moved listenToRoom to the top.');
  } else {
    console.log('Could not find insert location (end of leaveRoom).');
  }
} else {
  console.log('Could not find listenToRoom block.', listenStart, listenEnd);
}
