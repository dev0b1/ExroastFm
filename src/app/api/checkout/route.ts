import { NextRequest, NextResponse } from 'next/server';

// Server checkout removed in favor of client-hosted Dodo checkout.
// Return 410 Gone to make it explicit to callers that this route is no longer available.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Server checkout removed. Use client-hosted Dodo checkout.' },
    { status: 410 }
  );
}
