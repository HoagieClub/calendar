import { NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api';

import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	try {
		const res = await apiFetch(`/event/${req.nextUrl.search}`);
		const data = await res.json().catch(() => null);
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Could not load events';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
