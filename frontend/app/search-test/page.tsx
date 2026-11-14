'use client';

import { useState } from 'react';

import SearchBar, { type SearchFilters, emptyFilters } from '@/components/search/SearchBar';
import SearchResults from '@/components/search/SearchResults';

export default function SearchTestPage() {
	const [filters, setFilters] = useState<SearchFilters>(emptyFilters);

	const hasFilters = Object.values(filters).some(Boolean);

	return (
		<div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
			<SearchBar onSearch={setFilters} />

			{hasFilters ? (
				<SearchResults
					filters={filters}
					onSelectEvent={(ev) => console.log('open popup for', ev)}
				/>
			) : (
				<p>Calendar goes here.</p> // shown when everything is cleared
			)}
		</div>
	);
}
