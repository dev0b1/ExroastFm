// Server-side only imports
import { createCanvas } from 'canvas';
import { Readable } from 'stream';

// FFmpeg functions are stubbed for now - Turbopack doesn't support fluent-ffmpeg
// TODO: These should be implemented once we move to a separate service or use a different approach

export { configureFfmpeg, loadFfmpeg };

// Stub implementations to prevent build errors
async function configureFfmpeg() {
  // FFmpeg configuration stubbed - to be implemented with external service
  console.warn('FFmpeg configuration: not implemented in build');
}

async function loadFfmpeg() {
  // FFmpeg loading stubbed - to be implemented with external service
  return null;
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
  // Stubbed - FFmpeg will be moved to external service
  throw new Error('Audio trimming not yet implemented - use external service');
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
  // Stubbed - FFmpeg will be moved to external service
  throw new Error('Video generation not yet implemented - use external service');
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
  // Stubbed - FFmpeg will be moved to external service
  throw new Error('Audio duration detection not yet implemented - use external service');
}
