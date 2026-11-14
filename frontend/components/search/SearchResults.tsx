'use client';

import { Loading, Empty, ErrorState } from '@/components/AsyncState';
import type { SearchFilters } from '@/components/search/SearchBar';
import { useEventList } from '@/lib/useEventList';

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
	const params = new URLSearchParams();
	if (filters.query) {
		params.set('query', filters.query);
	}
	if (filters.from) {
		params.set('start_time', new Date(`${filters.from}T00:00:00`).toISOString());
	}
	if (filters.to) {
		params.set('end_time', new Date(`${filters.to}T23:59:59.999`).toISOString());
	}
	const { events, isLoading, error, retry } = useEventList(`/api/event?${params}`);
	const results = events
		.filter(
			(event) =>
				event.name.toLowerCase().includes(filters.name.toLowerCase()) &&
				event.host.toLowerCase().includes(filters.host.toLowerCase())
		)
		.map((event) => ({ ...event, title: event.name }));
	if (isLoading) {
		return <Loading label='Finding matching events.' />;
	}
	if (error) {
		return (
			<ErrorState
				message='We couldn’t search for events. Please try again.'
				onRetry={retry}
			/>
		);
	}
	if (results.length === 0) {
		return <Empty message='No events match your search.' />;
	}

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
							<strong>{ev.title}</strong>
							<br />
							<span style={{ fontSize: 13, color: '#6b7280' }}>
								{new Date(ev.start).toLocaleString([], {
									dateStyle: 'medium',
									timeStyle: 'short',
								})}{' '}
								· {ev.host}
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
