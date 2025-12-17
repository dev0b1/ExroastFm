import { NextRequest, NextResponse } from 'next/server';
import { saveDailyCheckIn, getUserStreak, getUserSubscriptionStatus, getTodayCheckIn } from '@/lib/db-service';
import { selectMotivation } from '@/lib/daily-motivations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mood, message } = body;

    if (!userId || !mood || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent double check-in: bail early if there's already a check-in today
    const existing = await getTodayCheckIn(userId);
    if (existing) {
      return NextResponse.json({ error: 'already_checked_in', message: 'User already checked in today' }, { status: 409 });
    }

    // Select the best motivation based on user's mood and message content
    const motivation = selectMotivation(mood, message);

    // Save check-in without audio URL (text-only motivations)
    const savedCheckInId = await saveDailyCheckIn({
      userId,
      mood,
      message,
      motivationText: motivation,
      motivationAudioUrl: undefined // No audio nudges
    });

    if (!savedCheckInId) {
      return NextResponse.json({ error: 'already_checked_in', message: 'User already checked in today' }, { status: 409 });
    }

    const streakData = await getUserStreak(userId);

    // If user row missing or streak still 0 after saving, report a client-visible streak of 1
    // so the UI reflects the first-day check-in even if the users table hasn't been initialized.
    const reportedStreak = (streakData?.currentStreak && streakData.currentStreak > 0) ? streakData.currentStreak : 1;

    return NextResponse.json({
      success: true,
      motivation,
      streak: reportedStreak
    });
  } catch (error) {
    console.error('Error generating motivation:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation' },
      { status: 500 }
    );
  }
}
