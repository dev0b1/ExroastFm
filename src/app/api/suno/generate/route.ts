import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/server/db';
import { songs } from '@/src/db/schema';
import { enqueueAudioJob } from '@/lib/db-service';

export async function POST(req: NextRequest) {
  // Suno-based generation is disabled. Return an explicit error so callers
  // know personalized/provider generation is not available.
  return NextResponse.json({ success: false, error: 'suno_disabled', message: 'Suno integration removed. Personalized generation is disabled.' }, { status: 503 });
}
