import { db } from '@/server/db';
import { templates } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

// ROAST MODE - Petty, savage, disrespectful energy
// GLOWUP MODE - Healing, empowerment, confidence energy
const TEMPLATE_DATA = [
  // ------- ROAST MODE -------
  {
    filename: 'petty-breakup.mp3',
    keywords: 'cheated, betrayal, petty, savage, drag, roast',
    mode: 'roast',
    mood: 'petty',
    storageUrl: '/templates/petty-breakup.mp3',
    title: 'Petty Breakup',
    description: 'Maximum pettiness. Maximum disrespect. Drag them for cheating or betrayal.',
  },
  {
    filename: 'ghosted-diss.mp3',
    keywords: 'ghosted, ignored, disappeared, roast, petty, clown',
    mode: 'roast',
    mood: 'ghosted',
    storageUrl: '/templates/ghosted-diss.mp3',
    title: 'Ghosted Diss',
    description: 'A disrespectful roast track for when they vanished like a clown.',
  },
  {
    filename: 'savage-confidence.mp3',
    keywords: 'savage, roast, diss, confidence, fierce, sarcasm',
    mode: 'roast',
    mood: 'savage',
    storageUrl: '/templates/savage-confidence.mp3',
    title: 'Savage Mode',
    description: 'Pure disrespect and fire bars. For dragging someone without remorse.',
  },

  // ------- GLOWUP MODE -------
  {
    filename: 'healing-journey.mp3',
    keywords: 'healing, moving on, glow up, strength, empowerment',
    mode: 'glowup',
    mood: 'healing',
  // Public file renamed to a clean name
  storageUrl: '/templates/healing-journey.mp3',
    title: 'Healing Journey',
    description: 'A powerful glow-up anthem for moving on and becoming unstoppable.',
  },
  {
    filename: 'self-love-anthem.mp3',
    keywords: 'glow up, confidence, empowerment, boss, winning',
    mode: 'glowup',
    mood: 'confidence',
    storageUrl: '/templates/self-love-anthem.mp3',
    title: 'Self Love Anthem',
    description: 'A confident flex track that tells the world you are thriving now.',
  },
  {
    filename: 'vibe-check.mp3',
    keywords: 'vibe, cool, chill, funny, humor, glow up',
    mode: 'glowup',
    mood: 'funny',
    storageUrl: '/templates/vibe-check.mp3',
    title: 'Glow-Up Vibes',
    description: 'Lighthearted, funny glow-up energy. Chill and meme-friendly.',
  },
];

export async function seedTemplates() {
  try {
    console.log('🌱 Seeding templates...');
    
    for (const template of TEMPLATE_DATA) {
      const { filename, keywords, mode, mood, storageUrl, title, description } = template;
      
      // Check if template already exists
      const existing = await db
        .select()
        .from(templates)
        .where(eq(templates.filename, filename))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(templates).values({
          filename,
          keywords,
          mode,
          mood,
          storageUrl,
        });
        console.log(`✅ Created template: ${title}`);
      } else {
        console.log(`⏭️  Template already exists: ${title}`);
      }
    }
    
    console.log('✨ Template seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedTemplates().catch(console.error);
}
