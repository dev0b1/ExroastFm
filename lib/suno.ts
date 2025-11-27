
import axios from 'axios';

export interface SunoGenerationParams {
  prompt: string;
  title?: string;
  tags?: string;
  style?: string;
  make_instrumental?: boolean;
  callBackUrl?: string;
}

export interface SunoGenerationResult {
  id: string;
  audioUrl: string;
  videoUrl?: string;
  lyrics?: string;
  duration?: number;
  status: string;
  taskId?: string;
  audioId?: string;
  title?: string;
  imageUrl?: string;
}

export class SunoAPI {
  private apiKey: string;
  private baseUrl = 'https://api.sunoapi.org/api/v1'; // ✅ FIXED

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSong(params: SunoGenerationParams): Promise<SunoGenerationResult[]> {
    if (!this.apiKey) {
      throw new Error('Suno API key not configured');
    }

    try {
      console.info('[suno] generate request', { title: params.title, hasCallback: !!params.callBackUrl });

      // Build the simplified request body following Suno example
      const createBody: any = {
        prompt: params.prompt,
        title: params.title || undefined,
        style: params.tags || params.style || undefined,
        customMode: true,
        instrumental: !!params.make_instrumental,
        callBackUrl: params.callBackUrl || undefined,
      };

      const start = Date.now();
      const resp = await axios.post(
        `${this.baseUrl}/generate`,
        createBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const duration = Date.now() - start;
      const data = resp.data;
      console.info('[suno] generate response', { status: resp.status, durationMs: duration, dataPreview: JSON.stringify(data).slice(0,500) });

      // Return raw provider data to caller to handle (may include task id or immediate URLs)
      return Array.isArray(data) ? data : [data];
      
    } catch (error: any) {
      console.error('[suno] API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Suno API key');
      }
      if (error.response?.status === 402) {
        throw new Error('Insufficient Suno API credits');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error(`Failed to generate music: ${error.response?.data?.error || error.message}`);
    }
  }

  private async pollForCompletion(songIds: string[], maxAttempts = 60): Promise<SunoGenerationResult[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.sleep(3000);

      try {
        console.debug('[suno] poll attempt', { songIds, attempt: attempt + 1 });
        
        // ✅ CORRECT QUERY ENDPOINT
        const response = await axios.post(
          `${this.baseUrl}/music/query`,
          { ids: songIds },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const responseData = response.data.data || response.data;
        const songs = Array.isArray(responseData) ? responseData : [responseData];

        const allComplete = songs.every(song => 
          song && song.status === 'complete' && song.audio_url
        );

        if (allComplete) {
          console.info('[suno] songs complete', { songIds });
          
          return songs.map(song => ({
            id: song.id,
            audioUrl: song.audio_url,
            videoUrl: song.video_url,
            imageUrl: song.image_url || song.image_large_url,
            lyrics: song.lyric || song.prompt,
            duration: song.duration || 0,
            status: 'complete',
            title: song.title,
            audioId: song.id,
          }));
        }

        if (songs.some(song => song && song.status === 'error')) {
          throw new Error('Song generation failed');
        }
      } catch (error: any) {
        if (attempt === maxAttempts - 1) throw error;
      }
    }

    throw new Error('Song generation timed out');
  }

  async generateMp4(options: { 
    taskId: string; 
    audioId: string; 
    callBackUrl?: string;
    author?: string;
    domainName?: string;
  }) {
    try {
      const body: any = {
        taskId: options.taskId,
        audioId: options.audioId,
      };
      if (options.callBackUrl) body.callBackUrl = options.callBackUrl;
      if (options.author) body.author = options.author;
      if (options.domainName) body.domainName = options.domainName;

      const url = `${this.baseUrl}/mp4/generate`;
      console.info('[suno] mp4 generate request', { taskId: options.taskId, audioId: options.audioId });
      
      const resp = await axios.post(url, body, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      const mp4TaskId = resp.data?.data?.id || resp.data?.id;
      console.info('[suno] mp4 task created', { mp4TaskId });
      
      return { raw: resp.data, mp4TaskId };
    } catch (err: any) {
      console.error('[suno] MP4 generation error', err?.response?.data);
      throw new Error('Failed to generate MP4');
    }
  }

  async pollForMp4(mp4TaskId: string, maxAttempts = 60) {
    const url = `${this.baseUrl}/mp4/get`;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.sleep(3000);
      
      try {
        const resp = await axios.get(`${url}?id=${encodeURIComponent(mp4TaskId)}`, {
          headers: { 'Authorization': `Bearer ${this.apiKey}` },
        });

        const data = resp.data?.data || resp.data;
        const item = Array.isArray(data) ? data[0] : data;
        
        if (item && item.status === 'complete') {
          const videoUrl = item.video_url || item.mp4_url;
          if (videoUrl) {
            console.info('[suno] mp4 ready', { videoUrl });
            return { videoUrl };
          }
        }

        if (item && item.status === 'error') {
          throw new Error('MP4 generation failed');
        }
      } catch (err: any) {
        if (attempt === maxAttempts - 1) throw err;
      }
    }
    
    throw new Error('MP4 generation timed out');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createSunoClient(): SunoAPI {
  const apiKey = process.env.SUNO_API_KEY || '';
  if (!apiKey) {
    console.warn('[suno] No API key found');
  }
  return new SunoAPI(apiKey);
}