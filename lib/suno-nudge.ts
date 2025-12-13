// Suno nudge client stubbed for PREMADE / provider-disabled mode.
// This keeps imports safe while preventing any runtime calls to Suno.
export interface NudgeGenerationParams {
  userStory: string;
  dayNumber: number;
  userName?: string;
}

export interface NudgeGenerationResult {
  id: string;
  audioUrl: string;
  motivationText: string;
  duration: number;
}

export function createSunoNudgeClient() {
  return {
    async generateAudioNudge(_params: NudgeGenerationParams): Promise<NudgeGenerationResult> {
      throw new Error('suno_disabled');
    },
    async generateDailyNudge(_params: { userStory: string; mood: string; motivationText?: string; dayNumber?: number; userName?: string; }): Promise<NudgeGenerationResult> {
      throw new Error('suno_disabled');
    }
  } as const;
}

// keep a lightweight fallback motivator for UI text
export function getDailySavageQuote(dayNumber: number = 1): string {
  const fallbacks = [
    "You're the plot twist they didn't see coming.",
    "Their loss, your glow-up.",
    "Keep shining — drama is for extras.",
  ];
  return fallbacks[(Math.max(0, dayNumber - 1)) % fallbacks.length];
}
