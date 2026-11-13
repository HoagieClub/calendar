import { NextRequest, NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api';

export async function GET(req: NextRequest) {
	const { search } = req.nextUrl;
	const res = await apiFetch(`/event/${search}`);
	return NextResponse.json(await res.json(), { status: res.status });
}