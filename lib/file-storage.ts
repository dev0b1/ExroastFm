import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');
const TEMPLATES_DIR = path.join(STORAGE_DIR, 'templates');
const PREVIEWS_DIR = path.join(TEMPLATES_DIR, 'previews');

async function ensureDirectories() {
  await mkdir(TEMPLATES_DIR, { recursive: true });
  await mkdir(PREVIEWS_DIR, { recursive: true });
}

export async function uploadTemplateAudio(
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    await ensureDirectories();
    const filePath = path.join(TEMPLATES_DIR, filename);
    await writeFile(filePath, buffer);
    return `/uploads/templates/${filename}`;
  } catch (error) {
    console.error('Error uploading template audio:', error);
    return null;
  }
}

export async function uploadPreviewAudio(
  buffer: Buffer,
  filename: string
): Promise<string | null> {
  try {
    await ensureDirectories();
    const filePath = path.join(PREVIEWS_DIR, filename);
    await writeFile(filePath, buffer);
    return `/uploads/templates/previews/${filename}`;
  } catch (error) {
    console.error('Error uploading preview audio:', error);
    return null;
  }
}
