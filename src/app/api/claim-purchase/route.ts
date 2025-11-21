import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	// Placeholder: claim purchase endpoint removed/disabled.
	// This route will be implemented when server-side auto-claim is enabled.
	return NextResponse.json({ ok: false, message: 'claim-purchase disabled' }, { status: 501 });
}

export async function POST(request: NextRequest) {
	return NextResponse.json({ ok: false, message: 'claim-purchase disabled' }, { status: 501 });
}
