import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/supabase-service';

export async function GET(request: NextRequest) {
  try {
    const templates = await getAllTemplates();
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates'
      },
      { status: 500 }
    );
  }
}
