'use client';

import { useCallback, useEffect, useState } from 'react';

import type { CalendarEvent } from '@/types';

export const REQUEST_TIMEOUT_MS = 15000;

type State = { url: string; attempt: number; events: CalendarEvent[]; error: boolean };

export function useEventList(url: string) {
	const [attempt, setAttempt] = useState(0);
	const [state, setState] = useState<State | null>(null);
	const retry = useCallback(() => setAttempt((value) => value + 1), []);
	// Discard the previous range immediately, including when navigating back before a fetch settles.
	if (state && (state.url !== url || state.attempt !== attempt)) {
		setState(null);
	}

	useEffect(() => {
		const controller = new AbortController();
		let active = true;
		const timer = setTimeout(() => {
			if (active) {
				active = false;
				controller.abort();
				setState({ url, attempt, events: [], error: true });
			}
		}, REQUEST_TIMEOUT_MS);
		void fetch(url, { signal: controller.signal, cache: 'no-store' })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('Request failed');
				}
				const data: unknown = await response.json();
				if (
					!Array.isArray(data) ||
					!data.every(
						(event) =>
							event &&
							(typeof event.id === 'string' || typeof event.id === 'number') &&
							typeof event.name === 'string' &&
							typeof event.host === 'string' &&
							typeof event.location === 'string' &&
							typeof event.description === 'string' &&
							typeof event.start === 'string' &&
							typeof event.end === 'string' &&
							Number.isFinite(Date.parse(event.start)) &&
							Number.isFinite(Date.parse(event.end))
					)
				) {
					throw new Error('Invalid event response');
				}
				if (active) {
					setState({ url, attempt, events: data as CalendarEvent[], error: false });
				}
			})
			.catch(() => {
				if (active) {
					setState({ url, attempt, events: [], error: true });
				}
			})
			.finally(() => clearTimeout(timer));
		return () => {
			active = false;
			clearTimeout(timer);
			controller.abort();
		};
	}, [url, attempt]);

	const current = state?.url === url && state.attempt === attempt ? state : null;
	return {
		events: current?.events ?? [],
		isLoading: !current,
		error: current?.error ?? false,
		retry,
	};
}
