/**
 * @overview Thin fetch wrapper for calls to the Hoagie Calendar backend.
 *
 * Requests go through the Next.js route at `app/api/hoagie/[...path]`, which attaches the
 * Auth0 access token and forwards to `HOAGIE_API_URL`. Pass backend paths exactly as Django
 * routes them, e.g. `apiFetch('/event/')` or `apiFetch('/category/')`.
 *
 * Copyright © 2021-2026 Hoagie Club and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree or at https://github.com/HoagieClub/calendar/blob/main/LICENSE.
 *
 * Permission is granted under the MIT License to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the software. This software is provided "as-is", without warranty of any kind.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/hoagie';

export class ApiError extends Error {
	status: number;
	body: unknown;

	constructor(message: string, status: number, body: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
	/** JSON-serialisable body. Objects are stringified and sent as application/json. */
	body?: object | string;
}

/**
 * Pull a readable message out of a Django REST Framework error payload.
 * DRF returns either `{ detail: '...' }`, `{ error: '...' }`, or `{ field: ['msg', ...] }`.
 */
function describeError(body: unknown, status: number): string {
	if (typeof body === 'string' && body.trim()) {
		return body;
	}
	if (body && typeof body === 'object') {
		const record = body as Record<string, unknown>;
		if (typeof record.detail === 'string') {
			return record.detail;
		}
		if (typeof record.error === 'string') {
			return record.error;
		}
		const fieldErrors = Object.entries(record)
			.map(([field, value]) => {
				const messages = Array.isArray(value) ? value.join(' ') : String(value);
				return `${field}: ${messages}`;
			})
			.filter(Boolean);
		if (fieldErrors.length > 0) {
			return fieldErrors.join(' ');
		}
	}
	return `Request failed with status ${status}.`;
}

/**
 * Fetch JSON from the backend. Throws `ApiError` on any non-2xx response so callers can
 * `try/catch` and never report success for a failed request.
 */
export async function apiFetch<T = unknown>(
	path: string,
	options: ApiFetchOptions = {}
): Promise<T> {
	const { body, headers, ...rest } = options;
	// Next.js redirects `/api/hoagie/event/` to `/api/hoagie/event` (308), so strip the trailing
	// slash here; the route handler adds it back when forwarding to Django.
	const [rawPath, query] = path.split('?', 2);
	const trimmed = rawPath.replace(/\/+$/, '');
	const normalisedPath = `${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}${query ? `?${query}` : ''}`;

	const response = await fetch(`${API_BASE}${normalisedPath}`, {
		...rest,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		body: body === undefined || typeof body === 'string' ? body : JSON.stringify(body),
	});

	const text = await response.text();
	let parsed: unknown = null;
	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			parsed = text;
		}
	}

	if (!response.ok) {
		throw new ApiError(describeError(parsed, response.status), response.status, parsed);
	}

	return parsed as T;
}

export default apiFetch;
