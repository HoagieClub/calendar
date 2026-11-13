import { auth0 } from './auth0';

const HOAGIE_API_URL = process.env.HOAGIE_API_URL;

export async function apiFetch(path: string, init: RequestInit = {}) {
	if (!HOAGIE_API_URL) {
		throw new Error('API_URL is not set');
	}

	const { token } = await auth0.getAccessToken();

	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${token}`);

	return fetch(`${HOAGIE_API_URL}${path}`, { ...init, headers });
}
