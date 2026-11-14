/**
 * @overview Authenticated proxy from the Next.js app to the Hoagie Calendar backend.
 *
 * `/api/hoagie/<path>` forwards to `${HOAGIE_API_URL}<path>/` with the signed-in user's Auth0
 * access token as a Bearer header. Mirrors the route used by HoagieMail so the frontend never
 * holds backend credentials. `HOAGIE_API_URL` must end with a trailing slash.
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

import { auth0 } from '@/lib/auth0';

import type { NextRequest } from 'next/server';

type RouteContext = { params: Promise<{ path: string[] }> };

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unknown error';
}

async function handler(request: NextRequest, { params }: RouteContext) {
	const path = (await params).path.join('/');
	const search = request.nextUrl.search;

	const headers: Record<string, string> = { 'Content-Type': 'application/json' };

	try {
		const accessToken = await auth0.getAccessToken();
		headers.Authorization = `Bearer ${accessToken.token}`;
	} catch (error) {
		return NextResponse.json({ error: errorMessage(error) }, { status: 401 });
	}

	const init: RequestInit = { method: request.method, headers };
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = await request.text();
	}

	const base = process.env.HOAGIE_API_URL ?? '';
	return proxyRequest(`${base}${path}/${search}`, init);
}

async function proxyRequest(url: string, init: RequestInit) {
	try {
		const response = await fetch(url, init);

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
	} catch (error) {
		return NextResponse.json({ error: errorMessage(error) }, { status: 502 });
	}
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
