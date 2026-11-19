'use client';

import { useEffect, useState } from 'react';

// Adjust to match your real response from /event/.
export type EventResult = {
	id: string | number;
	name: string;
	start: string; // ISO date-time
	host: string;
	category: number[];
};

type Props = {
	query: string;
	categories: { id: number; name: string }[];
	/** Opens the event popup (CALR-7). */
	onSelectEvent: (event: EventResult) => void;
};

export default function SearchResults({ query, categories, onSelectEvent }: Props) {
	const [results, setResults] = useState<EventResult[] | null>(null);
	const [error, setError] = useState(false);

	const names = new Map(categories.map((c) => [c.id, c.name]));

	useEffect(() => {
		const ctrl = new AbortController(); // ignore stale responses
		setResults(null);
		setError(false);

		fetch(`/api/event/?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
			.then((r) => {
				if (!r.ok) throw new Error(String(r.status));
				return r.json();
			})
			.then(setResults)
			.catch((e) => {
				if (e.name !== 'AbortError') setError(true);
			});

		return () => ctrl.abort();
	}, [query]);

	if (error) return <p role='alert'>Something went wrong. Please try again.</p>;
	if (results === null) return <p>Searching…</p>;
	if (results.length === 0) return <p>No events match your search.</p>;

	return (
		<ul
			style={{
				listStyle: 'none',
				margin: 0,
				padding: 0,
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
			}}
		>
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
							<strong>{ev.name}</strong>
							<br />
							<span style={{ fontSize: 13, color: '#6b7280' }}>
								{new Date(ev.start).toLocaleString([], {
									dateStyle: 'medium',
									timeStyle: 'short',
								})}{' '}
								· {ev.host}
							</span>
						</span>

						<span style={{ display: 'flex', gap: 4 }}>
							{ev.category.map((id) => {
								const name = names.get(id);
								if (!name) return null; // unknown ID: skip rather than show a number
								return (
									<span
										key={id}
										style={{
											fontSize: 11,
											fontWeight: 600,
											padding: '2px 8px',
											borderRadius: 999,
											background: '#e6f6f6',
											color: '#167a7a',
										}}
									>
										{name}
									</span>
								);
							})}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
