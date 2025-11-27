import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { songs } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.info('[api/song] GET hit', { id, url: request.url });
    
    const songResult = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    const song = songResult[0];

    if (!song) {
      console.info('[api/song] song not found', { id });
      return NextResponse.json(
        { success: false, error: "Song not found" },
        { status: 404 }
      );
    }

    console.info('[api/song] returning song', { id: song.id, isPurchased: song.isPurchased, hasFullUrl: !!song.fullUrl, previewUrl: !!song.previewUrl });
    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        story: song.story,
        style: song.style,
        lyrics: song.lyrics || '',
        previewUrl: song.previewUrl,
        fullUrl: song.isPurchased ? song.fullUrl : song.previewUrl,
        isPurchased: song.isPurchased,
        isTemplate: song.isTemplate || false,
        createdAt: song.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}
