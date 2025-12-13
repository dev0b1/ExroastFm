import { claimPendingJob, markJobSucceeded, markJobFailed, saveAudioNudge, refundCredit } from '../lib/db-service';
import { PREMADE_ONLY } from '../src/lib/config';
import { eq } from 'drizzle-orm';

async function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

async function processJob(job: any) {
  const jobId = job.id;
  console.info('[worker] processing job', { jobId: jobId, type: job.type });
  let payload: any;
  try {
    payload = JSON.parse(job.payload);
  } catch (e) {
    await markJobFailed(jobId, 'Invalid job payload');
    return;
  }

  // Provider-backed generation disabled: immediately fail provider jobs.
  if (job.type === 'song' || job.type === 'daily' || job.type === 'eleven') {
    console.info('[worker] external provider generation disabled — failing job', { jobId, type: job.type });
    // If credits were reserved, attempt refund.
    try {
      if (payload && payload.reservedCredit && payload.userId) {
        await refundCredit(payload.userId);
      }
    } catch (e) {
      console.warn('[worker] failed to refund credit after disabling job', e);
    }
    await markJobFailed(jobId, 'provider_integration_disabled');
    return;
  }

  // If the app is running in PREMADE_ONLY mode, skip heavy generation jobs.
  // This mode is used when the app serves pre-made premium songs instead of
  // generating audio/video via providers and ffmpeg.
  if (PREMADE_ONLY && (job.type === 'song' || job.type === 'eleven')) {
    console.info('[worker] PREMADE_ONLY mode active — skipping heavy job', { jobId, type: job.type });
    await markJobFailed(jobId, 'deprecated_in_premade_mode');
    return;
  }
  try {
    const payloadSize = Buffer.byteLength(job.payload || '', 'utf8');
    console.debug('[worker] job payload parsed', { jobId, payloadSize, keys: Object.keys(payload || {}) });
  } catch (err) {
    console.warn('[worker] failed to inspect payload size', err);
  }

  try {
    if (job.type === 'eleven') {
      const { songId, story, style, mood, duration } = payload;
      console.info('[worker] processing eleven job', { jobId, songId, style, mood });
      try {
        const { generateLyricsFromLLM, splitLyricsIntoLines } = await import('../lib/llm');
        const { generateMusicWithEleven, downloadToFile } = await import('../lib/eleven');
        const { makeLyricVideo } = await import('../lib/video');

        const lyrics = await generateLyricsFromLLM(story, style, mood || 'savage', 10);
        const lines = splitLyricsIntoLines(lyrics).slice(0, 12);

        // update song with lyrics
        try {
          const { db } = await import('../server/db');
          const { songs } = await import('../src/db/schema');
          await db.update(songs).set({ lyrics, updatedAt: new Date() }).where(eq((songs as any).id, songId));
        } catch (e) {
          console.warn('[worker] failed to update song lyrics', e);
        }

        // call ElevenLabs
        const elevenResp = await generateMusicWithEleven(lyrics, style, mood || 'savage', duration || 60);
        const audioFilePath = require('path').join(process.cwd(), 'tmp', `${songId}.mp3`);
        if (elevenResp.audioUrl) {
          await downloadToFile(elevenResp.audioUrl, audioFilePath);
        } else if (elevenResp.audioBuffer) {
          const fs = await import('fs');
          await fs.promises.mkdir(require('path').dirname(audioFilePath), { recursive: true });
          await fs.promises.writeFile(audioFilePath, elevenResp.audioBuffer);
        } else {
          throw new Error('No audio returned from ElevenLabs');
        }

        // render video
        const outDir = require('path').join(process.cwd(), 'public', 'generated');
        await import('fs').then(fs => fs.default.mkdirSync(outDir, { recursive: true }));
        const outPath = require('path').join(outDir, `${songId}.mp4`);

        makeLyricVideo({ audioPath: audioFilePath, outPath, lyricsLines: lines, durationSeconds: duration || 60 });

        // update song row with final URL
        const publicUrl = `/generated/${songId}.mp4`;
        try {
          const { db } = await import('../server/db');
          const { songs } = await import('../src/db/schema');
          await db.update(songs).set({ previewUrl: publicUrl, fullUrl: publicUrl, isPurchased: true, updatedAt: new Date() }).where(eq((songs as any).id, songId));
        } catch (e) {
          console.warn('[worker] failed to update song with video url', e);
        }

        await markJobSucceeded(jobId, publicUrl);
      } catch (err) {
        console.error('[worker] eleven job failed', err);
        await markJobFailed(jobId, (err instanceof Error) ? err.message : String(err));
      }
    } else {
      await markJobFailed(jobId, `Unsupported job type: ${job.type}`);
    }
  } catch (err: unknown) {
    const errMsg = (err instanceof Error) ? (err.message || String(err)) : (typeof err === 'object' ? JSON.stringify(err) : String(err));
    console.error('Job processing failed:', errMsg);
    // Attempt a refund if credits were reserved for this job
    try {
      if (payload?.reservedCredit) {
        await refundCredit(payload.userId, 1);
      }
    } catch (e) {
      console.warn('Failed to refund credit on job failure:', e);
    }
    await markJobFailed(jobId, (err instanceof Error && err.message) ? err.message : 'Unknown error');
  }
}

async function runWorker() {
  console.log('Audio worker started');
  while (true) {
    try {
      const job = await claimPendingJob();
      if (!job) {
        await sleep(2000);
        continue;
      }
      console.log('Claimed job', job.id, job.type);
      await processJob(job);
    } catch (e) {
      console.error('Worker loop error:', e);
      await sleep(3000);
    }
  }
}

if (require.main === module) {
  runWorker().catch(err => {
    console.error('Worker crashed:', err);
    process.exit(1);
  });
}

export default runWorker;
