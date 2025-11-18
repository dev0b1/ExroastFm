#!/usr/bin/env node

/**
 * Placeholder MP3 Generator
 * 
 * Creates minimal valid MP3 files for testing template matching
 * Each file is ~1KB and plays ~1 second of silence
 * 
 * Usage: node scripts/generate-template-placeholders.js
 * Output: public/templates/*.mp3
 */

const fs = require('fs');
const path = require('path');

// Minimal valid MP3 header + silent frame
// This is a real MP3 header + silence payload (~1KB)
const MP3_FRAME = Buffer.from([
  0xFF, 0xFA, 0x90, 0x00, // MP3 frame sync + header
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  // Repeat this pattern to make a ~1KB file
]);

const TEMPLATES = [
  // ROAST MODE
  {
    filename: 'petty-breakup.mp3',
    description: 'Petty Breakup - Maximum pettiness and disrespect',
  },
  {
    filename: 'ghosted-diss.mp3',
    description: 'Ghosted Diss - Disrespectful roast for ghosting',
  },
  {
    filename: 'savage-confidence.mp3',
    description: 'Savage Mode - Pure fire bars and confidence',
  },
  // GLOWUP MODE
  {
    filename: 'healing-journey.mp3',
    description: 'Healing Journey - Powerful glow-up anthem',
  },
  {
    filename: 'self-love-anthem.mp3',
    description: 'Self Love Anthem - Confident flex and thriving',
  },
  {
    filename: 'vibe-check.mp3',
    description: 'Glow-Up Vibes - Funny, chill glow-up energy',
  },
];

const OUTPUT_DIR = path.join(__dirname, '../public/templates');

function generatePlaceholders() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}`);
  }

  // Generate placeholder MP3 for each template
  TEMPLATES.forEach(({ filename, description }) => {
    const filepath = path.join(OUTPUT_DIR, filename);
    
    // Create ~1KB placeholder
    const buffer = Buffer.alloc(1024, MP3_FRAME);
    
    try {
      fs.writeFileSync(filepath, buffer);
      console.log(`✅ Created: ${filename} (${description})`);
    } catch (error) {
      console.error(`❌ Failed to create ${filename}:`, error.message);
    }
  });

  console.log(`\n✨ Placeholder templates created in ${OUTPUT_DIR}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Replace placeholders with real MP3 files (30-35 seconds)`);
  console.log(`   2. Run: npm run db:seed`);
  console.log(`   3. Test on: http://localhost:5000/story`);
}

generatePlaceholders();
