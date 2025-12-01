import 'dotenv/config';
import { db } from '@/server/db';
import { premiumSongs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

// Add entries here to seed premium songs into DB. These mirror public/premium-songs/manifest.json
const PREMIUM_DATA = [
  {
    id: 'p1',
    title: 'Petty Pop',
    description: 'A catchy pop roast with bubbly vocals and punchy drops.',
    tags: 'cheater,pop,short,funny',
    mp3: '/premium-songs/petty-pop.mp3',
    mp4: '/premium-songs/petty-pop.mp4',
    duration: 30,
  },
  {
    id: 'p2',
    title: 'Sadistic R&B',
    description: 'Slow R&B with honeyed vocals and a savage hook.',
    tags: 'ex,rnb,slow,heartbreak',
    mp3: '/premium-songs/sadistic-rnb.mp3',
    mp4: '/premium-songs/sadistic-rnb.mp4',
    duration: 45,
  },
  {
    id: 'p3',
    title: 'Angry Rock',
    description: 'Gritty electric guitar and anthemic chorus for maximum clapback.',
    tags: 'cheated,rock,angry,loud',
    mp3: '/premium-songs/angry-rock.mp3',
    mp4: '/premium-songs/angry-rock.mp4',
    duration: 60,
  },
];

export async function seedPremiumSongs() {
  try {
    console.log('🌱 Seeding premium songs...');
    for (const s of PREMIUM_DATA) {
      const existing = await db.select().from(premiumSongs).where(eq(premiumSongs.id, s.id)).limit(1);
      if (!existing || existing.length === 0) {
        await db.insert(premiumSongs).values({
          id: s.id,
          title: s.title,
          description: s.description,
          tags: s.tags,
          mp3: s.mp3,
          mp4: s.mp4,
          duration: s.duration,
        });
        console.log(`✅ Created premium song: ${s.title}`);
      } else {
        console.log(`⏭️  Already exists: ${s.title}`);
      }
    }
    console.log('✨ Premium song seeding complete!');
  } catch (err) {
    console.error('❌ Error seeding premium songs:', err);
    throw err;
  }
}

if (require.main === module) {
  seedPremiumSongs().catch(console.error);
}
