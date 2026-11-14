'use client';

import { useEffect, useState } from 'react';

import type { SearchFilters } from '@/components/search/SearchBar';

// Adjust to match your real response from /event/.
export type EventResult = {
	id: string | number;
	title: string;
	start: string; // ISO date-time
	host: string;
	category?: string;
};

type Props = {
	filters: SearchFilters;
	/** Opens the event popup (CALR-7). */
	onSelectEvent: (event: EventResult) => void;
};

export default function SearchResults({ filters, onSelectEvent }: Props) {
	const [results, setResults] = useState<EventResult[] | null>(null);
	const [error, setError] = useState(false);

	// Stable dependency: the filters object changes identity on every emit.
	const key = JSON.stringify(filters);

	useEffect(() => {
		const ctrl = new AbortController(); // ignore stale responses
		setResults(null);
		setError(false);

		// Only send non-empty params. Param names are a guess: match your Python endpoint.
		const params = new URLSearchParams();
		if (filters.query) params.set('q', filters.query);
		if (filters.name) params.set('name', filters.name);
		if (filters.host) params.set('host', filters.host);
		if (filters.from) params.set('from', filters.from);
		if (filters.to) params.set('to', filters.to);

		fetch(`/event/?${params}`, { signal: ctrl.signal })
			.then((r) => {
				if (!r.ok) throw new Error(String(r.status));
				return r.json();
			})
			.then(setResults)
			.catch((e) => {
				if (e.name !== 'AbortError') setError(true);
			});

		return () => ctrl.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	if (error) return <p role='alert'>Something went wrong. Please try again.</p>;
	if (results === null) return <p>Searching…</p>;
	if (results.length === 0) return <p>No events match your search.</p>;

	return (
		<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
			{results.map((ev) => (
				<li key={ev.id}>
					<button
						type='button'
						onClick={() => onSelectEvent(ev)}
						style={{
							width: '100%',
							textAlign: 'left',
							background: '#fff',
							border: '1px solid #d9dee3',
							borderRadius: 8,
							padding: '10px 12px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: 12,
						}}
					>
						<span style={{ flex: 1 }}>
							<strong>{ev.title}</strong>
							<br />
							<span style={{ fontSize: 13, color: '#6b7280' }}>
								{new Date(ev.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} · {ev.host}
							</span>
						</span>
						{ev.category && (
							<span
								style={{
									fontSize: 11,
									fontWeight: 600,
									padding: '2px 8px',
									borderRadius: 999,
									background: '#e6f6f6',
									color: '#167a7a',
								}}
							>
								{ev.category}
							</span>
						)}
					</button>
				</li>
			))}
		</ul>
	);
}