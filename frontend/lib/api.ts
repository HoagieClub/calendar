import { auth0 } from './auth0';

// Accept the base URL with or without a trailing slash; callers always pass paths that
// start with `/`, so the host can never be altered by the path.
const HOAGIE_API_URL = process.env.HOAGIE_API_URL?.replace(/\/+$/, '');

export async function apiFetch(path: string, init: RequestInit = {}) {
	if (!HOAGIE_API_URL) {
		throw new Error('HOAGIE_API_URL is not set');
	}

	const { token } = await auth0.getAccessToken();

	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${token}`);

	return fetch(`${HOAGIE_API_URL}${path}`, { ...init, headers });
}
