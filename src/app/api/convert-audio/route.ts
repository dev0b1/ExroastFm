import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import crypto from 'crypto';

type Body = {
  audioUrl?: string;
  audioBase64?: string; // data URL or raw base64
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { audioUrl, audioBase64 } = body;

    if (!audioUrl && !audioBase64) {
      return NextResponse.json({ success: false, error: 'audioUrl or audioBase64 required' }, { status: 400 });
    }

    const tmpDir = os.tmpdir();
    const id = crypto.randomUUID();
    const inPath = path.join(tmpDir, `${id}.mp3`);

    // Fetch or write input audio
    if (audioUrl) {
      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
      const ab = await res.arrayBuffer();
      await fs.writeFile(inPath, Buffer.from(ab));
    } else {
      // audioBase64 may be a data URL or raw base64
      let base = audioBase64 as string;
      const m = base.match(/^data:audio\/[^;]+;base64,(.*)$/);
      if (m) base = m[1];
      await fs.writeFile(inPath, Buffer.from(base, 'base64'));
    }

    // Ensure output directory exists
    const outDir = path.join(process.cwd(), 'public', 'converted');
    await fs.mkdir(outDir, { recursive: true });

    const outName = `${Date.now()}-${id}.mp4`;
    const outPath = path.join(outDir, outName);

    // Build the filter string (kept exactly as provided)
    const filter = `[0:a]showcqt=s=1080x1920:bar_h=1080:count=8:fps=60:tc=0.15:sonly=0:cscheme=#FF006E|#8338EC|v`;

    // ffmpeg command. Use shell so complex quoted filter works reliably.
    const cmd = `ffmpeg -y -i "${inPath}" -filter_complex "${filter}" -map \"[v]\" -map 0:a -c:v libx264 -preset fast -crf 23 -c:a copy "${outPath}"`;

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(cmd, { shell: true });
      let stderr = '';
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      proc.on('error', (err) => reject(err));
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(0, 2000)}`));
      });
    });

    // Cleanup input file
    await fs.unlink(inPath).catch(() => {});

    const publicUrl = `/converted/${outName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('[convert-audio] error', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
