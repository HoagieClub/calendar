import { NextResponse } from 'next/server';

import { auth0 } from '@/lib/auth0';

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ collection: string }> }
) {
	const { collection } = await params;
	if (!['events', 'saved'].includes(collection)) {
		return NextResponse.json({ error: 'Not found' }, { status: 404 });
	}
	const session = await auth0.getSession();
	if (!session) {
		return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
	}
	try {
		const { token } = await auth0.getAccessToken();
		const baseURL = process.env.BACKEND_URL || 'http://localhost:8000';
		const response = await fetch(`${baseURL.replace(/\/$/, '')}/user/${collection}/`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Unable to load events' },
				{ status: response.status }
			);
		}
		return NextResponse.json(await response.json());
	} catch {
		return NextResponse.json({ error: 'Unable to load events' }, { status: 502 });
	}
}
