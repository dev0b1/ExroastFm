
// Suno integration removed/stubbed.
// This module provides a minimal stub so remaining imports do not crash.

export function createSunoClient() {
  return {
    generateSong: async () => { throw new Error('Suno integration disabled'); },
    generateMp4: async () => { throw new Error('Suno integration disabled'); },
    pollForMp4: async () => { throw new Error('Suno integration disabled'); },
  };
}