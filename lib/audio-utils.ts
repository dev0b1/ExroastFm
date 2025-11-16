import ffmpeg from 'fluent-ffmpeg';
import { createCanvas } from 'canvas';
import { Readable } from 'stream';

try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  if (ffmpegInstaller && ffmpegInstaller.path) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }
} catch (error) {
  console.warn('ffmpeg installer not available, using system ffmpeg');
}

export interface AudioTrimOptions {
  inputUrl: string;
  duration: number;
  startTime?: number;
}

export async function trimAudioToPreview(
  inputBuffer: Buffer,
  outputPath: string,
  duration: number = 15,
  startTime: number = 0
): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(inputBuffer);
    
    ffmpeg(inputStream)
      .setStartTime(startTime)
      .setDuration(duration)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .format('mp3')
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .save(outputPath);
  });
}

export interface VideoGenerationOptions {
  audioBuffer: Buffer;
  lyrics: string;
  title: string;
  outputPath: string;
  watermark?: string;
  isPro?: boolean;
}

export async function createShareVideo(options: VideoGenerationOptions): Promise<void> {
  const { audioBuffer, lyrics, title, outputPath, watermark, isPro = false } = options;

  const width = 1080;
  const height = 1920;
  const fps = 30;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🔥', width / 2, 200);

  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#ff006e';
  const titleLines = wrapText(ctx, title, width - 200);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 350 + i * 70);
  });

  const lyricsLines = lyrics.split('\n').filter(l => l.trim());
  ctx.font = 'bold 50px Arial';
  ctx.fillStyle = '#ffd23f';
  
  const startY = 600;
  lyricsLines.slice(0, 6).forEach((line, i) => {
    const wrappedLines = wrapText(ctx, line.trim(), width - 200);
    wrappedLines.forEach((wrappedLine, j) => {
      ctx.fillText(wrappedLine, width / 2, startY + (i + j) * 80);
    });
  });

  if (!isPro && watermark) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(watermark, width / 2, height - 150);
    
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = '#ff006e';
    ctx.fillText('ExRoast.fm', width / 2, height - 80);
  }

  const frameBuffer = canvas.toBuffer('image/png');
  
  return new Promise((resolve, reject) => {
    const audioStream = Readable.from(audioBuffer);
    const imageStream = Readable.from(frameBuffer);

    ffmpeg()
      .input(imageStream)
      .inputOptions(['-loop 1', '-framerate 1'])
      .input(audioStream)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest',
        '-vf scale=1080:1920'
      ])
      .format('mp4')
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .save(outputPath);
  });
}

function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function getAudioDuration(buffer: Buffer): Promise<number> {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    
    ffmpeg.ffprobe(stream, (err: any, metadata: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}
