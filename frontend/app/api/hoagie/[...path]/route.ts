/**
 * @overview Authenticated proxy from the browser to the Hoagie Calendar backend.
 *
 * `/api/hoagie/<path>` forwards to `<HOAGIE_API_URL>/<path>/` on behalf of the signed-in user.
 * The token and the backend URL are handled by the server-only `apiFetch` in `lib/api.ts`, so
 * this file never touches Auth0 or `HOAGIE_API_URL` itself. The path always goes after a `/`
 * that this route inserts, so a request path can never change which host is called.
 *
 * Browser code should call this through `backendFetch` in `lib/backendFetch.ts`.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

import { NextResponse } from 'next/server';

import { apiFetch } from '@/lib/api';
import { auth0 } from '@/lib/auth0';

import type { NextRequest } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unknown error';
}

async function handler(request: NextRequest, { params }: RouteContext) {
	const session = await auth0.getSession();
	if (!session) {
		return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
	}

	// Segments are already URL-decoded and normalised by Next.js. Re-joined and placed after a
	// leading slash, they can only ever select a path on the configured backend host.
	const path = (await params).path.join('/');
	const backendPath = `/${path}/${request.nextUrl.search}`;

	const init: RequestInit = {
		method: request.method,
		headers: { 'Content-Type': 'application/json' },
		cache: 'no-store',
	};
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = await request.text();
	}

	let response: Response;
	try {
		response = await apiFetch(backendPath, init);
	} catch (error) {
		const message = errorMessage(error);
		// Misconfiguration (no HOAGIE_API_URL) is a server error; anything else means the
		// backend could not be reached or the token could not be issued.
		const status = message.includes('HOAGIE_API_URL') ? 500 : 502;
		return NextResponse.json({ error: message }, { status });
	}

	if (response.status === 204) {
		return new NextResponse(null, { status: 204 });
	}

	const text = await response.text();
	if (!response.ok) {
		let body: unknown = text;
		try {
			body = JSON.parse(text);
		} catch {
			// Non-JSON error body; forward the raw text.
		}
		return NextResponse.json(typeof body === 'string' ? { error: body } : body, {
			status: response.status,
		});
	}

	return new NextResponse(text, {
		status: response.status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
