import { NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api';

import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
	const { search } = req.nextUrl;
	const res = await apiFetch(`/event/${search}`);
	return NextResponse.json(await res.json(), { status: res.status });
}
